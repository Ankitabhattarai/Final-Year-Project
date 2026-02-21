const Hospital = require('../models/Hospital');

// Get my hospital
exports.getAllHospitals = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;
    // Return array to maintain frontend compatibility with .map
    const hospitals = await Hospital.find({ _id: hospitalId });
    res.json({ success: true, data: hospitals });
  } catch (error) {
    console.error('Get hospitals error:', error);
    res.status(500).json({ success: false, message: 'Error fetching hospital' });
  }
};

// Create a new hospital (Restricted)
exports.createHospital = async (req, res) => {
   return res.status(403).json({ success: false, message: 'Hospital Admins cannot create new hospitals' });
};

// Update my hospital
exports.updateHospital = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;
    
    // Ensure admin only updates their own hospital
    if (req.params.id.toString() !== hospitalId.toString()) {
        return res.status(403).json({ success: false, message: 'You can only update your own hospital' });
    }

    const hospital = await Hospital.findByIdAndUpdate(hospitalId, req.body, {
      new: true,
      runValidators: true
    });

    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    res.json({ success: true, message: 'Hospital updated successfully', data: hospital });
  } catch (error) {
    console.error('Update hospital error:', error);
    res.status(500).json({ success: false, message: 'Error updating hospital' });
  }
};

// Delete a hospital (Restricted)
exports.deleteHospital = async (req, res) => {
    return res.status(403).json({ success: false, message: 'Hospital Admins cannot delete hospitals' });
};

// Get my departments
exports.getAllDepartments = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;
    const hospital = await Hospital.findById(hospitalId).select('name departments');
    
    if (!hospital) {
        return res.json({ success: true, data: [] });
    }

    const allDepartments = hospital.departments.map(dept => ({
        ...dept.toObject(),
        hospitalId: hospital._id,
        hospitalName: hospital.name
    }));

    res.json({ success: true, data: allDepartments });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
};

// Add department to my hospital
exports.addDepartment = async (req, res) => {
  try {
    const { name, description, code } = req.body;
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    // Check duplicate
    if (hospital.departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Department already exists' });
    }

    const newDept = { name, description, code };
    hospital.departments.push(newDept);
    await hospital.save();

    const addedDept = hospital.departments[hospital.departments.length - 1];
    
    res.status(201).json({ 
      success: true, 
      message: 'Department added successfully', 
      data: {
        ...addedDept.toObject(),
        hospitalId: hospital._id,
        hospitalName: hospital.name
      }
    });

  } catch (error) {
    console.error('Add department error:', error);
    res.status(500).json({ success: false, message: 'Error adding department' });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { hospitalId: paramHospitalId, deptId } = req.params;
    const { name, code, description } = req.body;
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;

    // Verify hospital access
    if (paramHospitalId && paramHospitalId !== hospitalId.toString()) {
         return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
        return res.status(404).json({ success: false, message: 'Hospital not found' });
    }

    const department = hospital.departments.id(deptId);
    if (!department) {
        return res.status(404).json({ success: false, message: 'Department not found' });
    }

    if (name) department.name = name;
    if (code) department.code = code;
    if (description) department.description = description;

    await hospital.save();

    res.json({ 
        success: true, 
        message: 'Department updated successfully',
        data: {
            ...department.toObject(),
            hospitalId: hospital._id,
            hospitalName: hospital.name
        }
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({ success: false, message: 'Error updating department' });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
    try {
        const { hospitalId: paramHospitalId, deptId } = req.params;
        const hospitalId = req.user.hospitalId._id || req.user.hospitalId;

         // Verify hospital access
        if (paramHospitalId && paramHospitalId !== hospitalId.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
    
        const hospital = await Hospital.findById(hospitalId);
        if (!hospital) {
          return res.status(404).json({ success: false, message: 'Hospital not found' });
        }
        
        hospital.departments.pull({ _id: deptId }); 
        await hospital.save();
    
        res.json({ success: true, message: 'Department deleted successfully' });
    
      } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({ success: false, message: 'Error deleting department' });
      }
};
