// routes/admin.js
const express = require('express');
const router = express.Router();

const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  adminPing,
  listUsers,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
} = require('../controllers/admin');

// Authenticated admin ping (confirms token + role)
router.get('/ping', requireSignin, adminMiddleware, adminPing);

// Users admin endpoints
router.get('/users', requireSignin, adminMiddleware, listUsers);
router.patch(
  '/users/:id/status',
  requireSignin,
  adminMiddleware,
  updateUserStatus,
);
router.patch('/users/:id/role', requireSignin, adminMiddleware, updateUserRole);
router.post(
  '/users/:id/reset-password',
  requireSignin,
  adminMiddleware,
  resetUserPassword,
);

module.exports = router;
