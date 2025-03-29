const express = require('express');
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');
const validateSession = require('../middleware/validate');

// console.log('=== DEBUGGING ROUTES/SESSIONS ===');
// console.log('Type of sessionController:', typeof sessionController);
// console.log('Contents of sessionController:', Object.keys(sessionController));
// console.log('Type of createSession:', typeof sessionController.createSession);
// console.log('Type of auth middleware:', typeof auth);
// console.log('Type of validate middleware:', typeof validateSession);

const router = express.Router();

router.post('/', auth, validateSession, sessionController.createSession);
router.get('/', auth, sessionController.getUserSessions);

module.exports = router;