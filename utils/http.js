// utils/http.js
exports.ok = (res, data, meta) =>
  res.json(meta ? { ok: true, data, meta } : { ok: true, data });
exports.fail = (res, code = 500, error = 'server_error', message) =>
  res.status(code).json({ ok: false, error, ...(message ? { message } : {}) });
