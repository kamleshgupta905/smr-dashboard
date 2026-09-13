const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Default admin fallback for initial setup
    if (email === 'admin@smr.com' && password === 'admin123') {
      return res.json({
        success: true,
        token: generateToken('default_admin_id'),
        user: { name: 'Admin', email: 'admin@smr.com', role: 'admin' },
      });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      user.lastLoginAt = new Date();
      await user.save();

      return res.json({
        success: true,
        token: generateToken(user._id),
        user: { name: user.name, email: user.email, role: user.role },
      });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMe = async (req, res) => {
  return res.json({
    success: true,
    user: { name: 'Admin User', email: 'admin@smr.com', role: 'admin' },
  });
};
