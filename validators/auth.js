const { check } = require('express-validator');
const User = require('../models/user');
const {
  PASSWORD_REGEX,
  PASSWORD_MESSAGE,
} = require('@daidensacha/almanac-shared');

const userSignupValidator = [
  check('firstname').notEmpty().withMessage('First name is required'),
  check('lastname').notEmpty().withMessage('Last name is required'),
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password').matches(PASSWORD_REGEX).withMessage(PASSWORD_MESSAGE),
];

const userSigninValidator = [
  check('email').isEmail().withMessage('Must be a valid email address'),
  check('password').notEmpty().withMessage('Password is required'),
];

const userUpdateValidator = [
  check('firstname')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  check('lastname')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  check('password')
    .optional()
    .matches(PASSWORD_REGEX)
    .withMessage(PASSWORD_MESSAGE),
];

const forgotPasswordValidator = [
  check('email').isEmail().withMessage('Must be a valid email address'),
];

const resetPasswordValidator = [
  check('newPassword').matches(PASSWORD_REGEX).withMessage(PASSWORD_MESSAGE),
];

module.exports = {
  userSignupValidator,
  userSigninValidator,
  userUpdateValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
};

// const userSignupValidator = [
//   check('firstname').not().isEmpty().withMessage('First name is required'),
//   check('lastname').not().isEmpty().withMessage('Last name is required'),
//   check('email').isEmail().withMessage('Must be a valid email address'),
//   check('password')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/)
//     .withMessage(
//       'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number.',
//     ),
// ];

// const userSigninValidator = [
//   check('email').isEmail().withMessage('Must be a valid email address'),
//   check('password').not().isEmpty().withMessage('Password is required'),
// ];

// const userUpdateValidator = [
//   check('firstname').not().isEmpty().withMessage('First name is required'),
//   check('lastname').not().isEmpty().withMessage('Last name is required'),
//   check('password')
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/)
//     .withMessage(
//       'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number.',
//     ),
// ];

// const forgotPasswordValidator = [
//   check('email')
//     .not()
//     .isEmpty()
//     .isEmail()
//     .withMessage('Must be a valid email address'),
// ];

// const resetPasswordValidator = [
//   check('newPassword')
//     .not()
//     .isEmpty()
//     .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/)
//     .withMessage(
//       'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number.',
//     ),
// ];

// // Export the validator
// module.exports = {
//   userSignupValidator,
//   userSigninValidator,
//   userUpdateValidator,
//   forgotPasswordValidator,
//   resetPasswordValidator,
// };
