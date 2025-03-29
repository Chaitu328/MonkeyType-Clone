const Session = require('../models/Session');

// console.log('=== DEBUGGING SESSION CONTROLLER ===');
// console.log('Session model:', Session ? 'Loaded' : 'Not loaded');

const createSession = async (req, res) => {
  // console.log('createSession called');
  try {
    const sessionData = {
      ...req.body,
      user: req.user._id
    };
    // console.log("Fetching sessions for user:", sessionData.user)
    const session = await Session.create(sessionData);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getUserSessions = async (req, res) => {
  // console.log('getUserSessions called');
  try {
    const { page = 1, limit = 10 } = req.query;
    const sessions = await Session.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Session.countDocuments({ user: req.user._id });

    res.json({
      sessions,
      total,
      pages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createSession,
  getUserSessions
};