const Hospital = require('../models/Hospital');

// Get hospital profile for logged-in admin
exports.getHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospitalId);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      data: hospital
    });

  } catch (error) {
    console.error('Get hospital profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hospital profile'
    });
  }
};

// Update hospital profile
exports.updateHospitalProfile = async (req, res) => {
  try {
    const {
      name,
      address,
      contact,
      departments,
      operatingHours,
      capacity
    } = req.body;

    // Validation
    if (!name || !address || !contact) {
      return res.status(400).json({
        success: false,
        message: 'Name, address, and contact information are required'
      });
    }

    const updateData = {
      name,
      address,
      contact,
      operatingHours,
      capacity
    };

    // Handle departments update
    if (departments && Array.isArray(departments)) {
      updateData.departments = departments.map(dept => ({
        name: dept.name,
        description: dept.description || '',
        isActive: dept.isActive !== undefined ? dept.isActive : true
      }));
    }

    const hospital = await Hospital.findByIdAndUpdate(
      req.hospitalId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    res.json({
      success: true,
      message: 'Hospital profile updated successfully',
      data: hospital
    });

  } catch (error) {
    console.error('Update hospital profile error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating hospital profile'
    });
  }
};

// Get hospital departments
exports.getDepartments = async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.hospitalId).select('departments');
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    const activeDepartments = hospital.departments.filter(dept => dept.isActive);

    res.json({
      success: true,
      data: activeDepartments
    });

  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching departments'
    });
  }
};

// Add new department
exports.addDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required'
      });
    }

    const hospital = await Hospital.findById(req.hospitalId);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Check if department already exists
    const existingDept = hospital.departments.find(
      dept => dept.name.toLowerCase() === name.toLowerCase() && dept.isActive
    );

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department already exists'
      });
    }

    hospital.departments.push({
      name,
      description: description || '',
      isActive: true
    });

    await hospital.save();

    res.status(201).json({
      success: true,
      message: 'Department added successfully',
      data: hospital.departments[hospital.departments.length - 1]
    });

  } catch (error) {
    console.error('Add department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding department'
    });
  }
};

// Update department
exports.updateDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { name, description, isActive } = req.body;

    const hospital = await Hospital.findById(req.hospitalId);
    
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    const department = hospital.departments.id(departmentId);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    if (name) department.name = name;
    if (description !== undefined) department.description = description;
    if (isActive !== undefined) department.isActive = isActive;

    await hospital.save();

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });

  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating department'
    });
  }
};
