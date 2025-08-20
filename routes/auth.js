// routes/auth.js
const express = require('express');
const router = express.Router();

const {
  signup,
  accountActivation,
  signin,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth');

const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth');

const { runValidation } = require('../validators');

// --- Health check (no auth) ---
router.get('/auth/health', (req, res) => {
  res.json({ ok: true, service: 'auth', timestamp: Date.now() });
});

// Signup → sends activation email
router.post('/signup', userSignupValidator, runValidation, signup);

// Activate account (token from email)
router.post('/account-activation', accountActivation);

// Sign in → returns JWT + user
router.post('/signin', userSigninValidator, runValidation, signin);

// Forgot password → sends reset email
router.put(
  '/forgot-password',
  forgotPasswordValidator,
  runValidation,
  forgotPassword,
);

// Reset password (with token)
router.put(
  '/reset-password',
  resetPasswordValidator,
  runValidation,
  resetPassword,
);

module.exports = router;
