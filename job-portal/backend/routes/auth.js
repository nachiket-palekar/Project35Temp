const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  resetPasswordForm, // 🆕 add this controller
} = require('../controllers/authController');

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', loginUser);

// Email verification
router.get('/verify-email', verifyEmail);

// Forgot password (send email)
router.post('/forgot-password', forgotPassword);

// Reset password (from form)
router.post('/reset-password', resetPassword);

// 🆕 Show simple message/page when user clicks reset link
router.get('/reset-password', resetPasswordForm);

module.exports = router;
