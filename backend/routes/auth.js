const express = require('express');
const { signup, login, getUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', auth, getUser);

module.exports = router;