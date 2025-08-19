const express = require('express');
const router = express.Router();

//  Import controllers
const {
  signup,
  accountActivation,
  signin,
  forgotPassword,
  resetPassword,
  // googleLogin
} = require('../controllers/auth');

//  Import validators
const {
  userSignupValidator,
  userSigninValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/auth');

//  Import middlewares
const { runValidation } = require('../validators');

router.post('/signup', userSignupValidator, runValidation, signup);
router.post('/account-activation', accountActivation);
router.post('/signin', userSigninValidator, runValidation, signin);
router.put(
  '/forgot-password',
  forgotPasswordValidator,
  runValidation,
  forgotPassword,
);
router.put(
  '/reset-password',
  resetPasswordValidator,
  runValidation,
  resetPassword,
);

// Forgot password routes
// router.put('/forgot-password', forgotPasswordValidator, runValidation, forgotPassword);
// router.put('/reset-password', resetPasswordValidator, runValidation, resetPassword);

// Google login
// router.post('/google-login', googleLogin);

module.exports = router;
