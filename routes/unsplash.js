// routes/unsplash.js
const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');

const router = express.Router();

/** -------------------------------------------------------
 * Tiny in-memory cache with TTL (no deps)
 * ------------------------------------------------------*/
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_ENTRIES = 200; // simple size guard

// Map<key, { value, expiresAt }>
const cache = new Map();

function getCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}
function setCache(key, value, ttl = CACHE_TTL_MS) {
  // simple prune if we overflow
  if (cache.size >= MAX_ENTRIES) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { value, expiresAt: Date.now() + ttl });
}

/** -------------------------------------------------------
 * GET /api/unsplash/photos?query=raspberries
 * ------------------------------------------------------*/
router.get('/photos', async (req, res) => {
  try {
    const raw = (req.query.query || '').toString().trim();
    if (!raw) return res.status(400).json({ error: 'Missing query' });

    // normalize accents (safer queries) and build a stable cache key
    const fixed = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const cacheKey = `unsplash:${fixed.toLowerCase()}`;

    // 1) Try cache
    const cached = getCache(cacheKey);
    if (cached) {
      // let the browser cache it too
      res.set('Cache-Control', 'public, max-age=3600');
      return res.json(cached);
    }

    // 2) Hit Unsplash
    const resp = await axios.get('https://api.unsplash.com/photos/random', {
      params: {
        query: fixed,
        orientation: 'landscape',
        content_filter: 'high',
      },
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
      timeout: 6000,
    });

    const { urls = {}, alt_description, description } = resp.data || {};
    const payload = {
      url: urls.regular || urls.full || urls.small || null,
      alt: alt_description || description || fixed,
      query: fixed,
    };

    // 3) Save to cache and set browser cache headers
    setCache(cacheKey, payload);
    res.set('Cache-Control', 'public, max-age=3600');
    return res.json(payload);
  } catch (err) {
    const status = err.response?.status || 500;
    logger.error('Unsplash fetch error:', err.message);

    // soft-fail so UI can fallback
    if ([403, 404, 429].includes(status)) {
      res.set('Cache-Control', 'public, max-age=600'); // cache the null for 10 min
      return res
        .status(200)
        .json({ url: null, alt: 'fallback', query: req.query.query });
    }

    return res.status(status).json({ error: 'Unsplash fetch failed' });
  }
});

module.exports = router;

// // routes/unsplash.js
// const express = require('express');
// const axios = require('axios');
// const logger = require('../utils/logger');

// const router = express.Router();

// // GET /api/unsplash/photos?query=raspberries
// router.get('/photos', async (req, res) => {
//   try {
//     const raw = (req.query.query || '').toString().trim();
//     if (!raw) return res.status(400).json({ error: 'Missing query' });

//     // normalize accents (safer queries)
//     const fixed = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

//     const resp = await axios.get('https://api.unsplash.com/photos/random', {
//       params: {
//         query: fixed,
//         orientation: 'landscape',
//         content_filter: 'high',
//       },
//       headers: {
//         Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
//       },
//       timeout: 6000,
//     });

//     const { urls = {}, alt_description, description } = resp.data || {};
//     res.json({
//       url: urls.regular || urls.full || urls.small || null,
//       alt: alt_description || description || fixed,
//       query: fixed,
//     });
//   } catch (err) {
//     const status = err.response?.status || 500;
//     logger.error('Unsplash fetch error:', err.message);
//     if (status === 403 || status === 404 || status === 429) {
//       // return a soft-fail payload so the client can fallback
//       return res
//         .status(200)
//         .json({ url: null, alt: 'fallback', query: req.query.query });
//     }
//     res.status(status).json({ error: 'Unsplash fetch failed' });
//   }
// });

// module.exports = router;
