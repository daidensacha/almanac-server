// controllers/admin.js
const Plant = require('../models/plant');
const Category = require('../models/category');
const Event = require('../models/event');

// controllers/admin.js
const User = require('../models/user');

exports.adminListUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 })
      .sort({ created_at: -1 })
      .lean();
    res.json({ ok: true, users });
  } catch (e) {
    next(e);
  }
};

// List ALL plants (admin) – hide heavy fields if you like
exports.adminListPlants = async (_req, res, next) => {
  try {
    const plants = await Plant.find({}, { __v: 0 })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, plants });
  } catch (e) {
    next(e);
  }
};

exports.adminListCategories = async (_req, res, next) => {
  try {
    const categories = await Category.find({}, { __v: 0 })
      .sort({ category_name: 1 })
      .lean();
    res.json({ ok: true, categories, allCategories: categories }); // both keys for FE compatibility
  } catch (e) {
    next(e);
  }
};

exports.adminListEvents = async (_req, res, next) => {
  try {
    const events = await Event.find({}, { __v: 0 })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, events });
  } catch (e) {
    next(e);
  }
};

// (Optional) quick stats endpoint for Admin Overview
exports.adminStats = async (_req, res, next) => {
  try {
    const [users, plants, categories, events] = await Promise.all([
      User.estimatedDocumentCount().exec(),
      Plant.estimatedDocumentCount().exec(),
      Category.estimatedDocumentCount().exec(),
      Event.estimatedDocumentCount().exec(),
    ]);
    res.json({ ok: true, counts: { users, plants, categories, events } });
  } catch (e) {
    next(e);
  }
};

// AdminPing

exports.adminPing = (req, res) => {
  // proves auth + admin guard worked and gives the dashboard a tiny payload
  return res.json({
    ok: true,
    message: 'admin pong',
    user: {
      _id: req.user?._id || req.auth?._id || null,
      role: req.user?.role || 'admin',
    },
    time: new Date().toISOString(),
  });
};
