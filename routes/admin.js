// routes/admin.js
const express = require('express');
const router = express.Router();

const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  adminPing,
  // listUsers,
  // updateUserStatus,
  // updateUserRole,
  // resetUserPassword,
  adminListUsers,
  adminListPlants,
  adminListCategories,
  adminListEvents,
  adminStats, // optional
} = require('../controllers/admin');

// Authenticated admin ping (confirms token + role)
router.get('/ping', requireSignin, adminMiddleware, adminPing);

// // Users
router.get('/users', requireSignin, adminMiddleware, adminListUsers);
// router.patch(
//   '/users/:id/status',
//   requireSignin,
//   adminMiddleware,
//   updateUserStatus,
// );
// router.patch('/users/:id/role', requireSignin, adminMiddleware, updateUserRole);
// router.post(
//   '/users/:id/reset-password',
//   requireSignin,
//   adminMiddleware,
//   resetUserPassword,
// );

// Almanac (admin-wide)
router.get('/plants', requireSignin, adminMiddleware, adminListPlants);
router.get('/categories', requireSignin, adminMiddleware, adminListCategories);
router.get('/events', requireSignin, adminMiddleware, adminListEvents);

// Optional stats for the admin overview cards
router.get('/stats', requireSignin, adminMiddleware, adminStats);

module.exports = router;
