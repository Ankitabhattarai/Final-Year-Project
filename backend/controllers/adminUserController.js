const User = require('../models/User');

// Get all users (with filtering)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, department } = req.query;
    // Filter by the admin's hospital
    let query = { 
        isActive: true,
        hospitalId: req.user.hospitalId._id || req.user.hospitalId // Ensure we get the ID
    };

    if (role) {
      query.role = role;
    }

    if (department) {
      query['employeeDetails.department'] = department;
    }

    const users = await User.find(query)
      .select('-password')
      .populate('hospitalId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// Create a new user (doctor, staff)
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, password, role, profile, employeeDetails } = req.body;
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;

    // Validation
    if (!fullName || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    // Prevent creating System Admins or other Hospital Admins (unless logic allows, usually one per hospital)
    if (role === 'admin' || role === 'hospital_admin') {
         return res.status(403).json({ success: false, message: 'Cannot create admin accounts' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const userData = {
        fullName,
        email,
        password,
        role,
        hospitalId, // Force assignment to current hospital
        profile: profile || {},
        isActive: true
    };

    if (employeeDetails) {
        userData.employeeDetails = {
            ...employeeDetails,
            isActive: true,
            joinDate: new Date()
        };
    }

    const user = await User.create(userData);

    const userResponse = await User.findById(user._id).select('-password').populate('hospitalId', 'name');

    res.status(201).json({ success: true, message: 'User created successfully', data: userResponse });

  } catch (error) {
    console.error('Create user error:', error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, role, profile, employeeDetails, available } = req.body;
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;
    
    // Check if user exists and belongs to this hospital
    const user = await User.findOne({ _id: req.params.id, hospitalId });
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found or not in your hospital' });
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (role) {
        if (role === 'admin' || role === 'hospital_admin') {
             return res.status(403).json({ success: false, message: 'Cannot promote to admin' });
        }
        user.role = role;
    }
    
    if (profile) {
        user.profile = { ...user.profile, ...profile };
    }

    if (employeeDetails) {
        user.employeeDetails = { ...user.employeeDetails, ...employeeDetails };
    }
    
    // Toggle availability
    if (available !== undefined && (user.role === 'doctor' || user.role === 'staff')) {
        if (!user.employeeDetails) user.employeeDetails = {};
        user.employeeDetails.isActive = available;
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password').populate('hospitalId', 'name');

    res.json({ success: true, message: 'User updated successfully', data: updatedUser });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Error updating user' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const hospitalId = req.user.hospitalId._id || req.user.hospitalId;
    const user = await User.findOne({ _id: req.params.id, hospitalId });
    
    if (!user) {
        return res.status(404).json({ success: false, message: 'User not found or not in your hospital' });
    }

    // Soft delete
    user.isActive = false;
    if (user.employeeDetails) {
        user.employeeDetails.isActive = false;
    }
    await user.save();

    res.json({ success: true, message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};
