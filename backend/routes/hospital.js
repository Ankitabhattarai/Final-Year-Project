const express = require('express');
const Hospital = require('../models/Hospital');
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess 
} = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);

// @route   GET /api/hospital/profile
// @desc    Get hospital profile for logged-in admin
// @access  Private (Hospital Admin)
router.get('/profile', requireHospitalAdmin, async (req, res) => {
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
});

// @route   PUT /api/hospital/profile
// @desc    Update hospital profile
// @access  Private (Hospital Admin)
router.put('/profile', requireHospitalAdmin, async (req, res) => {
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
});

// @route   GET /api/hospital/departments
// @desc    Get hospital departments
// @access  Private (Hospital Admin)
router.get('/departments', requireHospitalAdmin, async (req, res) => {
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
});

// @route   POST /api/hospital/departments
// @desc    Add new department
// @access  Private (Hospital Admin)
router.post('/departments', requireHospitalAdmin, async (req, res) => {
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
});

// @route   PUT /api/hospital/departments/:departmentId
// @desc    Update department
// @access  Private (Hospital Admin)
router.put('/departments/:departmentId', requireHospitalAdmin, async (req, res) => {
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
});

module.exports = router;