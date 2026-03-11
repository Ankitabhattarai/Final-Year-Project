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

        // Fetch features for prediction
        const queueLength = await Queue.countDocuments({
            hospitalId,
            doctorId,
            status: 'waiting'
        });

        // Simplified consult time (can be expanded to use historical data)
        const avgConsultTime = 15; 
        
        const now = new Date();
        const inputData = {
            queue_length: queueLength,
            avg_consult_time: avgConsultTime,
            day_of_week: now.getDay(),
            hour_of_day: now.getHours(),
            priority: priority === 'emergency' ? 3 : (priority === 'high' ? 2 : (priority === 'normal' ? 1 : 0)),
            no_show_rate: 0.1, // Placeholder
            department_id: departmentId 
        };

        const result = await runPythonScript('predict.py', inputData);
        
        res.json({
            success: true,
            data: result
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

            const now = new Date();
            return {
                doctor_id: doc._id.toString(),
                doctor_name: doc.fullName,
                specialization: doc.employeeDetails.specialization,
                queue_length: queueLength,
                avg_consult_time: 15,
                day_of_week: now.getDay(),
                hour_of_day: now.getHours(),
                priority: 1,
                no_show_rate: 0.1,
                department_id: 1 // Placeholder for numeric mapping
            };
        }));

        const result = await runPythonScript('recommend.py', options);

        res.json({
            success: true,
            data: result
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

            const now = new Date();
            return {
                doctor_id: doc._id.toString(),
                doctor_name: doc.fullName,
                specialization: doc.employeeDetails.specialization,
                department: doc.employeeDetails.department,
                hospital_name: hospital.name,
                hospital_id: hospital._id.toString(),
                queue_length: queueLength,
                avg_consult_time: 15,
                day_of_week: now.getDay(),
                hour_of_day: now.getHours(),
                priority: 1,
                no_show_rate: 0.1,
                department_id: 1 
            };
        }));

        // 5. Use the recommendation script to pick the best one
        const result = await runPythonScript('recommend.py', options);
        
        res.json({
            success: true,
            data: result.recommended
        });
    } catch (error) {
        console.error('AI Quick Suggestion error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
