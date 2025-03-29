const express = require('express');
const { getSessionAnalysis, getCommonErrors } = require('../controllers/analysisController');
const auth = require('../middleware/auth');

const router = express.Router();
router.get('/common-errors', auth, getCommonErrors);
router.get('/:id', auth, getSessionAnalysis);


module.exports = router;