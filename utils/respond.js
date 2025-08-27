// src/utils/respond.js
const logger = require('./logger');

function ok(res, code, data, meta) {
  logger.info({ code, meta }, 'OK');
  return res.status(code).json({ ok: true, ...data, meta });
}

function fail(res, err, code = 500, context = {}) {
  // Prefer explicit error fields if you set them elsewhere
  const msg = err?.message || 'Server error';
  logger.error({ code, err: msg, stack: err?.stack, ...context }, 'FAIL');
  return res.status(code).json({ ok: false, error: msg });
}

module.exports = { ok, fail };
