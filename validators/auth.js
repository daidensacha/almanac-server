const { check } = require('express-validator');
const User = require('../models/user');

const userSignupValidator = [
  check('firstname').not().isEmpty().withMessage('First name is required'),
  check('lastname').not().isEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,20}$/)
    .withMessage(
      'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number or special character.',
    ),
];

const userSigninValidator = [
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,20}$/)
    .withMessage(
      'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number or special character.',
    ),
];

const userUpdateValidator = [
  check('firstname').not().isEmpty().withMessage('First name is required'),
  check('lastname').not().isEmpty().withMessage('Last name is required'),
  check('password')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,20}$/)
    .withMessage(
      'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number or special character.',
    ),
];

const forgotPasswordValidator = [
  check('email')
    .not()
    .isEmpty()
    .isEmail()
    .withMessage('Must be a valid email address'),
];

const resetPasswordValidator = [
  check('newPassword')
    .not()
    .isEmpty()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,20}$/)
    .withMessage(
      'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number or special character.',
    ),
];

// Export the validator
module.exports = {
  userSignupValidator,
  userSigninValidator,
  userUpdateValidator,
  forgotPasswordValidator,
  resetPasswordValidator
};
