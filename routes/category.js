// routes/category.js
const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

const { requireSignin, attachUserFromJwt } = require('../controllers/auth');
const category = require('../controllers/category'); // must export functions below

// List mine (supports ?archived=true|false)
router.get(
  '/categories',
  requireSignin,
  attachUserFromJwt,
  (req, _res, next) => {
    logger.info({ user: req.user?._id }, 'REQ after auth');
    next();
  },
  category.listCategories,
);

// Get one (scoped to owner)
router.get(
  '/category/:id',
  requireSignin,
  attachUserFromJwt,
  category.getCategory,
);

// Create
router.post(
  '/category/create',
  requireSignin,
  attachUserFromJwt,
  category.createCategory,
);

// Update
router.put(
  '/category/update/:id',
  requireSignin,
  attachUserFromJwt,
  category.updateCategory,
);

// Archive / unarchive (PATCH body { archived: true|false })
router.patch(
  '/category/archive/:id',
  requireSignin,
  attachUserFromJwt,
  category.archiveCategory,
);

// Hard delete (owner only)
router.delete(
  '/category/delete/:id',
  requireSignin,
  attachUserFromJwt,
  category.deleteCategory,
);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const {
//   createCategory,
//   listCategories,
//   getCategory,
//   updateCategory,
//   archiveCategory,
//   deleteCategory,
// } = require('../controllers/category');

// router.post('/category/create', createCategory);
// router.get('/categories', listCategories);
// router.get('/category/:id', getCategory);
// router.put('/category/update/:id', updateCategory);
// router.patch('/category/archive/:id', archiveCategory);
// router.delete('/category/delete/:id', deleteCategory);

// module.exports = router;
