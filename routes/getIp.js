const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// ──────────────────────────────
// Detect loopback/private ranges
// ──────────────────────────────
function isLocalOrPrivate(ip = '') {
  if (!ip) return true;
  const v = String(ip).toLowerCase();
  return (
    v === '::1' ||
    v === '127.0.0.1' ||
    v.startsWith('::ffff:127.') || // IPv6-mapped loopback
    v.startsWith('192.168.') || // private
    v.startsWith('::ffff:192.168.') || // IPv6-mapped private
    /^10\./.test(v) || // private
    /^::ffff:10\./.test(v) || // IPv6-mapped private
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(v) || // private
    /^::ffff:172\.(1[6-9]|2\d|3[0-1])\./.test(v)
  );
}

// ──────────────────────────────
// Simple per-IP cache
// ──────────────────────────────
const CACHE_TTL = 60 * 1000; // 1 minute
const ipCache = new Map(); // key: ipKey → { t, data }

function getCache(ipKey) {
  const hit = ipCache.get(ipKey);
  if (hit && Date.now() - hit.t < CACHE_TTL) return hit.data;
  if (hit) ipCache.delete(ipKey);
  return null;
}

function setCache(ipKey, data) {
  ipCache.set(ipKey, { t: Date.now(), data });
  if (ipCache.size > 500) {
    // prune oldest if cache grows too big
    const oldestKey = [...ipCache.entries()].sort(
      (a, b) => a[1].t - b[1].t,
    )[0]?.[0];
    if (oldestKey) ipCache.delete(oldestKey);
  }
}

// ──────────────────────────────
// /api/ip route
// ──────────────────────────────
router.get('/ip', async (req, res) => {
  try {
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',').shift()?.trim() ||
      req.socket?.remoteAddress ||
      '';

    const useAuto =
      process.env.NODE_ENV === 'development' || isLocalOrPrivate(ip);
    const ipKey = useAuto ? 'auto' : ip;

    // cache hit?
    const cached = getCache(ipKey);
    if (cached) {
      logger.info('[IP ROUTE] cache hit for', ipKey, cached);
      return res.json(cached);
    }

    const url = useAuto
      ? 'http://ip-api.com/json?fields=status,message,lat,lon,city,country'
      : `http://ip-api.com/json/${encodeURIComponent(
          ip,
        )}?fields=status,message,lat,lon,city,country`;

    const r = await fetch(url);
    const j = await r.json();

    logger.info('[IP ROUTE] lookup result:', j);

    if (j.status !== 'success') {
      return res.json({ lat: null, lon: null, city: null, country: null });
    }

    const result = { lat: j.lat, lon: j.lon, city: j.city, country: j.country };
    logger.info('[IP ROUTE] fresh lookup stored for', ipKey, result);
    setCache(ipKey, result);

    return res.json(result);
  } catch (e) {
    logger.error('[IP ROUTE] error:', e);
    return res.json({ lat: null, lon: null, city: null, country: null });
  }
});

module.exports = router;
