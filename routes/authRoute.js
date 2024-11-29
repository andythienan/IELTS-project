const express = require('express');
const router = express.Router();
const authController = require('../controller/authController'); // Import controller

// Route đăng ký
router.post('/register', authController.register);

// Route đăng nhập
router.post('/login', authController.login);

module.exports = router;
