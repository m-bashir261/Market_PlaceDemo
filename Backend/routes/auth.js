const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route: POST /api/auth/register
router.post('/register', authController.register);

// Route: POST /api/auth/login
router.post('/login', authController.login);

router.get('/get-user', authController.protect ,authController.getUser);

// Route: GET /api/auth/seller/:username
router.get('/seller/:username', authController.getSellerInfo);

module.exports = router;