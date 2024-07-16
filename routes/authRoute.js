const express = require('express');
const router = express.Router();
const { registerUserCtrl, loginUserCtrl } = require('../controllers/authController');

// /api/auth/register
router.post('/register', registerUserCtrl);

// /api/auth/login
router.post('/login', loginUserCtrl);

module.exports = router;
