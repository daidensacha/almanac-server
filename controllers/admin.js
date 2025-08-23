// controllers/admin.js
exports.adminPing = (req, res) => {
  return res.json({
    ok: true,
    user: {
      id: req.auth?._id || null,
      role: req.profile?.role || 'unknown',
    },
  });
};
