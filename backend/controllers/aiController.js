const { spawn } = require('child_process');
const path = require('path');
const User = require('../models/User');
const Queue = require('../models/Queue');

/**
 * Helper to call Python scripts
 */
const runPythonScript = (scriptName, inputData) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../../ai', scriptName);
        const pythonProcess = spawn('python', [scriptPath, JSON.stringify(inputData)]);
        
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

        const result = await runPythonScript('predict.py', inputData);
        
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
            isActive: true
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

        const result = await runPythonScript('recommend.py', options);

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
        
        // 1. Find the first hospital if none is specified (or could be based on user location/history)
        const hospital = await Hospital.findOne({ isActive: true });
        if (!hospital) {
            return res.json({ success: true, data: null });
        }

        // 2. Define priority departments for quick suggestions
        const priorityDepts = ['General Medicine', 'Internal Medicine', 'Emergency', 'Cardiology'];
        
        // 3. Find doctors in these departments at this hospital
        let doctors = await User.find({
            hospitalId: hospital._id,
            role: 'doctor',
            'employeeDetails.department': { $in: priorityDepts },
            isActive: true
        });

        // If no doctors in priority depts, just get any doctors
        if (doctors.length === 0) {
            doctors = await User.find({
                hospitalId: hospital._id,
                role: 'doctor',
                isActive: true
            }).limit(5);
        }

        if (doctors.length === 0) {
            return res.json({ success: true, data: null });
        }

        // 4. Prepare data for the recommendation engine
        const options = await Promise.all(doctors.map(async (doc) => {
            const queueLength = await Queue.countDocuments({
                hospitalId: hospital._id,
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
                hospital_name: hospital.name,
                hospital_id: hospital._id.toString(),
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
        const result = await runPythonScript('recommend.py', options);
        
        // Return top 4 results with our enhanced fields
        const top4 = result.all_results ? result.all_results.slice(0, 4).map(r => ({
            ...r.option,
            predicted_wait_min: r.predicted_wait_min // use script result or our calc
        })) : [];
        
        res.json({
            success: true,
            data: top4
        });
    } catch (error) {
        console.error('AI Quick Suggestion error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
