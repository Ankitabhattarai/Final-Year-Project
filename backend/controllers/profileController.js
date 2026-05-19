const User = require('../models/User');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) {
        if (!user.profile) user.profile = {};
        user.profile.phone = phone;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both old and new passwords' });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Error updating password' });
  }
};
