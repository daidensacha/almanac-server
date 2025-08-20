const { expressjwt: expressJwt } = require('express-jwt');
const Category = require('../models/category');
const logger = require('../utils/logger');

const checkSignin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/signin');
};

// Middleware to check if Category exists for user before creating/ updating
const checkCategoryExists = async (req, res, next) => {
  const { category, description, created_by } = req.body;
  const findOne = await Category.findOne({
    category: category,
    created_by: req.auth._id,
  }).populate([
    {
      path: 'created_by',
      select: 'firstname lastname createdAt', // only return the Persons name
    },
  ]);
  logger.debug('Middleware findOne', findOne);
  if (findOne) {
    return res.status(400).json({
      error: 'Category already exist, oops!',
      category: findOne.category,
      description: findOne.description,
      created_by: `${findOne.created_by.firstname} ${findOne.created_by.lastname}`,
      created_at: findOne.created_by.createdAt.toDateString(),
    });
  } else {
    next();
  }
};

module.exports = {
  checkSignin,
  checkCategoryExists,
};
