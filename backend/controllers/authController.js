const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// Generate JWT Token with hospital info
const generateToken = (userId, role, hospitalId) => {
  return jwt.sign(
    { userId, role, hospitalId }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
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
    const user = new User({
      fullName,
      email,
      password,
      role: 'patient'
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role, user.hospitalId);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages[0]
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await User.findOne({ email, isActive: true })
      .populate('hospitalId', 'name address');
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role, user.hospitalId);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        hospital: user.hospitalId ? {
          id: user.hospitalId._id,
          name: user.hospitalId.name,
          address: user.hospitalId.address
        } : null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Login hospital admin with hospital verification
exports.hospitalAdminLogin = async (req, res) => {
  try {
    const { email, password, hospitalCode } = req.body;

    // Validation
    if (!email || !password || !hospitalCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and hospital code'
      });
    }

    // Find hospital by registration number
    const hospital = await Hospital.findOne({ 
      registrationNumber: hospitalCode,
      isActive: true 
    });

    if (!hospital) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hospital code'
      });
    }

    // Check if user exists and is hospital admin
    const user = await User.findOne({ 
      email, 
      role: 'hospital_admin',
      hospitalId: hospital._id,
      isActive: true 
    }).populate('hospitalId', 'name address');
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials or not authorized for this hospital'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role, user.hospitalId._id);

    res.json({
      success: true,
      message: 'Hospital admin login successful',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        mustChangePassword: user.mustChangePassword,
        hospital: {
          id: user.hospitalId._id,
          name: user.hospitalId.name,
          address: user.hospitalId.address
        }
      }
    });

  } catch (error) {
    console.error('Hospital admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};
// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid current password' });
    }

    // Update password
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
