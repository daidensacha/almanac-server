const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  create_category,
  get_all_categories, // <- returns only req.auth._id + archived:false
  get_category_id,
  update_category_id,
  archive_category_id,
  delete_category_id,
  listCategories, // <- admin-wide optional filters
} = require('../controllers/category');

// user-scoped categories (subscriber & admin see only their own on this path)
router.get('/categories', requireSignin, get_all_categories);

// admin-wide listing (optional filters ?created_by=&archived=)
router.get('/admin/categories', requireSignin, adminMiddleware, listCategories);

// keep the rest as-is
router.post('/category/create', requireSignin, create_category);
router.get('/category/:id', requireSignin, get_category_id);
router.put('/category/update/:id', requireSignin, update_category_id);
router.patch('/category/archive/:id', requireSignin, archive_category_id);
router.delete('/category/delete/:id', requireSignin, delete_category_id);

module.exports = router;
