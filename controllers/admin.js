// controllers/admin.js
const User = require('../models/user');

// Simple admin ping; also returns who you are
exports.adminPing = (req, res) => {
  res.json({ ok: true, user: { id: req.auth?._id, role: 'admin' } });
};

// List users (hide password and __v)
exports.listUsers = async (_req, res, next) => {
  try {
    const users = await User.find({}, { password: 0, __v: 0 })
      .sort({ created_at: -1 })
      .lean();
    res.json({ users });
  } catch (e) {
    next(e);
  }
};

// Update user status: body { status: 'active' | 'suspended' }
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status)
      return res.status(400).json({ ok: false, error: 'missing_status' });

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, projection: { password: 0, __v: 0 } },
    ).lean();

    if (!user) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
};

// Update user role: body { role: 'admin' | 'user' }
exports.updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!role)
      return res.status(400).json({ ok: false, error: 'missing_role' });

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, projection: { password: 0, __v: 0 } },
    ).lean();

    if (!user) return res.status(404).json({ ok: false, error: 'not_found' });
    res.json({ ok: true, user });
  } catch (e) {
    next(e);
  }
};

// Start a reset flow (stub for now)
exports.resetUserPassword = async (req, res, _next) => {
  // TODO: implement real reset (email token, etc.)
  res.json({ ok: true, message: 'reset initiated', userId: req.params.id });
};
