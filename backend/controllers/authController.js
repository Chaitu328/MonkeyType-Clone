const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await User.create({ username, email, password });
    const token = user.generateAuthToken();

    res.status(201).json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = user.generateAuthToken();
    res.json({ token, user: { id: user._id, username: user.username } });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUser = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  signup,
  login,
  getUser
}