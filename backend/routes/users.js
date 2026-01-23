const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { 
  authenticate, 
  requireHospitalAdmin, 
  requireHospitalAccess,
  enforceHospitalScope 
} = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);
router.use(requireHospitalAccess);
router.use(enforceHospitalScope);

// @route   GET /api/users
// @desc    Get all users for hospital (doctors, staff)
// @access  Private (Hospital Admin)
router.get('/', requireHospitalAdmin, async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10, search } = req.query;
    const hospitalId = req.hospitalId;

    // Build query
    let query = { 
      hospitalId,
      role: { $in: ['doctor', 'staff'] },
      isActive: true
    };

    if (role && ['doctor', 'staff'].includes(role)) {
      query.role = role;
    }

    if (department) {
      query['employeeDetails.department'] = department;
    }

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'employeeDetails.employeeId': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-password')
      .populate('hospitalId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   GET /api/users/:userId
// @desc    Get single user details
// @access  Private (Hospital Admin)
router.get('/:userId', requireHospitalAdmin, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.userId,
      hospitalId: req.hospitalId
    })
    .select('-password')
    .populate('hospitalId', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user (doctor/staff)
// @access  Private (Hospital Admin)
router.post('/', requireHospitalAdmin, async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      role,
      profile,
      employeeDetails
    } = req.body;

    // Validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Full name, email, password, and role are required'
      });
    }

    if (!['doctor', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either doctor or staff'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new user
    const userData = {
      fullName,
      email,
      password,
      role,
      hospitalId: req.hospitalId,
      profile: profile || {},
      employeeDetails: {
        ...employeeDetails,
        joinDate: employeeDetails?.joinDate || new Date(),
        isActive: true
      }
    };

    const user = new User(userData);
    await user.save();

    // Return user without password
    const userResponse = await User.findById(user._id)
      .select('-password')
      .populate('hospitalId', 'name');

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: userResponse
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating user'
    });
  }
});

// @route   PUT /api/users/:userId
// @desc    Update user
// @access  Private (Hospital Admin)
router.put('/:userId', requireHospitalAdmin, async (req, res) => {
  try {
    const {
      fullName,
      email,
      role,
      profile,
      employeeDetails
    } = req.body;

    // Find user and ensure they belong to the same hospital
    const user = await User.findOne({
      _id: req.params.userId,
      hospitalId: req.hospitalId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role && ['doctor', 'staff'].includes(role)) user.role = role;
    if (profile) user.profile = { ...user.profile, ...profile };
    if (employeeDetails) {
      user.employeeDetails = { ...user.employeeDetails, ...employeeDetails };
    }

    await user.save();

    // Return updated user without password
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('hospitalId', 'name');

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// @route   DELETE /api/users/:userId
// @desc    Deactivate user (soft delete)
// @access  Private (Hospital Admin)
router.delete('/:userId', requireHospitalAdmin, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.userId,
        hospitalId: req.hospitalId
      },
      { 
        isActive: false,
        'employeeDetails.isActive': false
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully',
      data: user
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deactivating user'
    });
  }
});

// @route   PUT /api/users/:userId/password
// @desc    Reset user password
// @access  Private (Hospital Admin)
router.put('/:userId/password', requireHospitalAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findOne({
      _id: req.params.userId,
      hospitalId: req.hospitalId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
});

module.exports = router;