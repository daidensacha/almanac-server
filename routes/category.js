const express = require('express');
const router = express.Router();

//  Import controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  create_category,
  get_all_categories,
  get_category_id,
  update_category_id,
  archive_category_id,
  delete_category_id
  } = require('../controllers/category');

const { checkCategoryExists } = require('../middleware/middleware');

//  Import validators
const { runValidation } = require('../validators');
const { categoryCreateValidator } = require('../validators/category');

// @route   GET api/category
router.post('/category/create',requireSignin, checkCategoryExists, create_category);
router.get('/categories', requireSignin, get_all_categories);
router.get('/category/:id', requireSignin, get_category_id);
router.put('/category/update/:id', requireSignin, update_category_id);
router.patch('/category/archive/:id', requireSignin, archive_category_id);
router.delete('/category/delete/:id', requireSignin, delete_category_id);



module.exports = router;