const { check } = require('express-validator');
// const Category = require('../models/category');

const categoryCreateValidator = [
  check('category')
    .not()
    .isEmpty()
    .withMessage('Category is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Category must be between 2 and 20 characters long'),
  check('description')
    .isLength({ min: 2, max: 120 })
    .withMessage('Description must be between 2 and 120 characters long'),
];

module.exports = {
  categoryCreateValidator,
};