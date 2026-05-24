const { spawn } = require('child_process');
const path = require('path');
const User = require('../models/User');
const Queue = require('../models/Queue');

const aiServiceBaseUrl = process.env.AI_SERVICE_URL || '';

/**
 * Helper to call Python scripts
 */
const runPythonScript = (scriptName, inputData) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../../ai', scriptName);
        const pythonCmd = process.platform === 'win32' ? 'py' : 'python';
        const pythonProcess = spawn(pythonCmd, [scriptPath, JSON.stringify(inputData)]);
        
        let dataStr = '';
        let errorStr = '';

        pythonProcess.stdout.on('data', (data) => {
            dataStr += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorStr += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(errorStr || `Process exited with code ${code}`));
            }
            try {
                resolve(JSON.parse(dataStr));
            } catch (e) {
                reject(new Error(`Failed to parse Python output: ${dataStr}`));
            }
        });
    });
};

const callAiService = async (endpointPath, payload) => {
    if (!aiServiceBaseUrl) {
        throw new Error('AI service URL is not configured');
    }

    const url = new URL(endpointPath, aiServiceBaseUrl);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        const data = await response.json();
        if (!response.ok || data.success === false) {
            throw new Error(data.message || `AI service returned ${response.status}`);
        }

        return data.data ?? data;
    } finally {
        clearTimeout(timeout);
    }
};

/**
 * GET wait time prediction for a specific doctor
 */


exports.predictWaitTime = async (req, res) => {
    try {
        const { doctorId, departmentId, priority = 'normal', hospitalId: queryHospitalId } = req.query;
        const hospitalId = req.hospitalId || queryHospitalId;

        if (!hospitalId) {
            return res.status(400).json({ success: false, message: 'Hospital ID is required' });
        }

        // Fetch doctor to get their speed
        const doctor = await User.findById(doctorId);
        const avgConsultTime = doctor?.employeeDetails?.avgConsultationTime || 15;
        const queueLength = Number(req.query.queueLength) || await Queue.countDocuments({
            hospitalId,
            doctorId,
            status: 'waiting'
        });
        
        const now = new Date();
        const availableAtDate = new Date(now.getTime() + (queueLength * avgConsultTime) * 60000);
        const availableAt = availableAtDate.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        });

        const inputData = {
            queue_length: queueLength,
            avg_consult_time: avgConsultTime,
            day_of_week: now.getDay(),
            hour_of_day: now.getHours(),
            priority: priority === 'emergency' ? 3 : (priority === 'high' ? 2 : (priority === 'normal' ? 1 : 0)),
            no_show_rate: 0.1, 
            department_id: departmentId 
        };

        let result;
        if (aiServiceBaseUrl) {
            try {
                result = await callAiService('/api/ai/predict', inputData);
            } catch (serviceError) {
                console.warn('AI service predict failed, falling back to local script:', serviceError.message || serviceError);
                result = await runPythonScript('predict.py', inputData);
            }
        } else {
            result = await runPythonScript('predict.py', inputData);
        }
        
        res.json({
            success: true,
            data: {
                ...result,
                predicted_waiting_time: queueLength * avgConsultTime, // Direct calc for realness
                available_at: availableAt
            }
        });
    } catch (error) {
        console.error('AI Predict error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET recommendations for doctors in a department
 */
exports.getRecommendations = async (req, res) => {
    try {
        const { department, hospitalId: queryHospitalId } = req.query;
        const hospitalId = req.hospitalId || queryHospitalId;

        if (!hospitalId) {
            return res.status(400).json({ success: false, message: 'Hospital ID is required' });
        }

        if (!department) {
            return res.status(400).json({ success: false, message: 'Department is required' });
        }

        // Find doctors in this department
        const doctors = await User.find({
            hospitalId,
            role: 'doctor',
            'employeeDetails.department': department,
            isActive: true,
            'employeeDetails.isActive': true
        });

        if (doctors.length === 0) {
            return res.json({ success: true, data: { recommended: null, all_results: [] } });
        }

        const options = await Promise.all(doctors.map(async (doc) => {
            const queueLength = await Queue.countDocuments({
                hospitalId,
                doctorId: doc._id,
                status: 'waiting'
            });

            const avgConsultTime = doc.employeeDetails?.avgConsultationTime || 15;
            const predictedWaitMin = queueLength * avgConsultTime;
            const now = new Date();
            const availableAtDate = new Date(now.getTime() + predictedWaitMin * 60000);
            const availableAt = availableAtDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });

            return {
                doctor_id: doc._id.toString(),
                doctor_name: doc.fullName,
                specialization: doc.employeeDetails.specialization,
                queue_length: queueLength,
                avg_consult_time: avgConsultTime,
                predicted_wait_min: predictedWaitMin,
                available_at: availableAt,
                day_of_week: now.getDay(),
                hour_of_day: now.getHours(),
                priority: 1,
                no_show_rate: 0.1,
                department_id: 1 
            };
        }));

        let result;
        if (aiServiceBaseUrl) {
            try {
                result = await callAiService('/api/ai/recommend', options);
            } catch (serviceError) {
                console.warn('AI service recommendation failed, falling back to local script:', serviceError.message || serviceError);
                result = await runPythonScript('recommend.py', options);
            }
        } else {
            result = await runPythonScript('recommend.py', options);
        }

        // Ensure all results have the calculated fields
        const enhancedResults = result.all_results ? result.all_results.map(r => ({
            ...r.option,
            predicted_wait_min: r.predicted_wait_min
        })) : [];

        res.json({
            success: true,
            data: {
                recommended: enhancedResults[0] || null,
                all_results: enhancedResults
            }
        });
    } catch (error) {
        console.error('AI Recommendation error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET a proactive quick suggestion for a new patient
 */
exports.getQuickSuggestion = async (req, res) => {
    try {
        const Hospital = require('../models/Hospital');
        const queryHospitalId = req.query.hospitalId;
        
        let hospitalMatch = {};
        
        // 1. Find hospitals to pull suggestions from
        if (queryHospitalId) {
            const hospital = await Hospital.findById(queryHospitalId);
            if (!hospital || !hospital.isActive) {
                return res.json({ success: true, data: [] });
            }
            hospitalMatch.hospitalId = hospital._id;
        } else {
            const activeHospitals = await Hospital.find({ isActive: true }).select('_id');
            if (activeHospitals.length === 0) {
                return res.json({ success: true, data: [] });
            }
            const activeHospitalIds = activeHospitals.map(h => h._id);
            hospitalMatch.hospitalId = { $in: activeHospitalIds };
        }

        // 2. Define priority departments for quick suggestions
        const priorityDepts = ['General Medicine', 'Internal Medicine', 'Emergency', 'Cardiology'];
        
        // 3. Find doctors in these departments
        let doctors = await User.find({
            ...hospitalMatch,
            role: 'doctor',
            'employeeDetails.department': { $in: priorityDepts },
            isActive: true,
            'employeeDetails.isActive': true
        }).populate('hospitalId');

        // If no doctors in priority depts, just get any doctors
        if (doctors.length === 0) {
            doctors = await User.find({
                ...hospitalMatch,
                role: 'doctor',
                isActive: true,
                'employeeDetails.isActive': true
            }).populate('hospitalId').limit(8);
        }

        if (doctors.length === 0) {
            return res.json({ success: true, data: [] });
        }

        // 4. Prepare data for the recommendation engine
        const options = await Promise.all(doctors.map(async (doc) => {
            const queueLength = await Queue.countDocuments({
                hospitalId: doc.hospitalId._id,
                doctorId: doc._id,
                status: 'waiting'
            });

            // Calculate "Real" wait time based on live queue and doctor's speed
            const avgConsultTime = doc.employeeDetails?.avgConsultationTime || 15;
            const predictedWaitMin = queueLength * avgConsultTime;
            
            // Calculate actual available time
            const now = new Date();
            const availableAtDate = new Date(now.getTime() + predictedWaitMin * 60000);
            const availableAt = availableAtDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
            });

            return {
                doctor_id: doc._id.toString(),
                doctor_name: doc.fullName,
                specialization: doc.employeeDetails.specialization,
                department: doc.employeeDetails.department,
                hospital_name: doc.hospitalId.name,
                hospital_id: doc.hospitalId._id.toString(),
                queue_length: queueLength,
                avg_consult_time: avgConsultTime,
                predicted_wait_min: predictedWaitMin,
                available_at: availableAt,
                day_of_week: now.getDay(),
                hour_of_day: now.getHours(),
                priority: 1,
                no_show_rate: 0.1,
                department_id: 1 
            };
        }));

        // 5. Use the recommendation script to sort them (still based on predicted_wait_min)
        let result;
        if (aiServiceBaseUrl) {
            try {
                result = await callAiService('/api/ai/quick-suggestion', options);
            } catch (serviceError) {
                console.warn('AI service quick suggestion failed, falling back to local script:', serviceError.message || serviceError);
                result = await runPythonScript('recommend.py', options);
            }
        } else {
            result = await runPythonScript('recommend.py', options);
        }
        
        // Return top 4 results with our enhanced fields
        const sourceResults = Array.isArray(result)
            ? result
            : (result.all_results || result.data || []);

        const top4 = sourceResults.slice(0, 4).map((r) => ({
            ...(r.option || r),
            predicted_wait_min: r.predicted_wait_min // use script result or our calc
        }));
        
        res.json({
            success: true,
            data: top4
        });
    } catch (error) {
        console.error('AI Quick Suggestion error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
