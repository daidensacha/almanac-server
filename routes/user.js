const express = require('express');
const router = express.Router();

const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { read, updateUser } = require('../controllers/user');
const { runValidation } = require('../validators');
const { userUpdateValidator } = require('../validators/auth'); // <-- use it

// Health check
router.get('/user/health', (req, res) => {
  res.json({ ok: true, service: 'user', timestamp: Date.now() });
});

// Get a specific user by id (protected)
router.get('/user/:id', requireSignin, read);

// Convenience: get current user (no :id needed)
router.get('/user/me', requireSignin, (req, res, next) => {
  // reuse the same controller by faking the param
  req.params.id = req.auth._id;
  return read(req, res, next);
});

// Update current user (protected + validated)
router.put(
  '/user/update',
  requireSignin,
  userUpdateValidator,
  runValidation,
  updateUser,
);

// Admin can update any user (protected + validated)
router.put(
  '/admin/update',
  requireSignin,
  adminMiddleware,
  userUpdateValidator,
  runValidation,
  updateUser,
);

module.exports = router;
