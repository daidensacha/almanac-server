const express = require('express');
const router = express.Router();

//  Import controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  create_category,
  get_all_categories,
  get_category_id,
  update_category_id,
  delete_category_id
  // categoryById
  //  readCategory,
  //  updateCategory,
  //  removeCategory
  } = require('../controllers/category');

const { uniqueCategoryAndUser } = require('../middleware/middleware');

//  Import validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');

// @route   GET api/category
router.post('/category/create',requireSignin, create_category);
router.get('/categories', requireSignin, get_all_categories);
router.get('/category/:id', requireSignin, get_category_id);
router.put('/category/:id', requireSignin, update_category_id);
router.delete('/category/:id', requireSignin, delete_category_id);
// router.get('/category/:slug', readCategory);
// router.put('/category/:slug', updateCategory);
// router.delete('/category/:slug', removeCategory);



module.exports = router;