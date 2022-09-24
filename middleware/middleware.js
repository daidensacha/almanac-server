const { expressjwt: expressJwt } = require('express-jwt');
const Category = require('../models/category');

const checkSignin = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/signin');
}

// const requireSignin = expressJwt({
//   secret: process.env.JWT_SECRET, // returns req.auth._id
//   algorithms: ['HS256'],
// })

const uniqueCategoryAndUser = (req, res, next) => {
  const { category, user } = req.body;
  console.log('user', req.user);
  Category.findOne({ category}).exec((err, category) => {
    if (category && category.created_by === user._id) {
      return res.status(400).json({
        error: 'Category already exist, oops!',
      });
    }
    next();
  });
}

module.exports = {
  checkSignin,
  uniqueCategoryAndUser,
};

