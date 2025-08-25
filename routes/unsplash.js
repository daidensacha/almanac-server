// routes/unsplash.js
const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');

const router = express.Router();

const CACHE_TTL_MS = 30 * 60 * 1000;
const MAX_ENTRIES = 200;
const cache = new Map();
const getCache = k => {
  const v = cache.get(k);
  if (!v) return null;
  if (Date.now() > v.expiresAt) {
    cache.delete(k);
    return null;
  }
  return v.value;
};
const setCache = (k, value, ttl = CACHE_TTL_MS) => {
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value);
  cache.set(k, { value, expiresAt: Date.now() + ttl });
};

// GET /api/unsplash/photos?query=raspberries
router.get('/photos', async (req, res) => {
  try {
    const raw = (req.query.query || '').toString().trim();
    if (!raw) return res.status(400).json({ error: 'Missing query' });

    const fixed = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const cacheKey = `unsplash:${fixed.toLowerCase()}`;

    const cached = getCache(cacheKey);
    if (cached) {
      res.set('Cache-Control', 'public, max-age=3600');
      return res.json(cached);
    }

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

    const d = resp.data || {};
    const { urls = {}, alt_description, description, links = {}, id, user } = d;

    const payload = {
      id,
      url: urls.regular || urls.full || urls.small || null,
      alt: alt_description || description || fixed,
      query: fixed,
      download_location: links?.download_location || null, // important for crediting
      author: user
        ? {
            name: user.name,
            username: user.username,
            profile: user.links?.html,
          }
        : null,
    };

    setCache(cacheKey, payload);
    res.set('Cache-Control', 'public, max-age=3600');
    return res.json(payload);
  } catch (err) {
    const status = err.response?.status || 500;
    logger.error('Unsplash fetch error:', err.message);
    if ([401, 403, 404, 429].includes(status)) {
      res.set('Cache-Control', 'public, max-age=600');
      return res
        .status(200)
        .json({ url: null, alt: 'fallback', query: req.query.query });
    }
    return res.status(status).json({ error: 'Unsplash fetch failed' });
  }
});

// GET /api/unsplash/download?id=PHOTO_ID
// or           /api/unsplash/download?location=DOWNLOAD_LOCATION
router.get('/download', async (req, res) => {
  try {
    const { id, location } = req.query;
    let downloadUrl = location;

    if (!downloadUrl && id) {
      // resolve download_location if only id is provided
      const info = await axios.get(`https://api.unsplash.com/photos/${id}`, {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      });
      downloadUrl = info.data?.links?.download_location;
    }

    if (!downloadUrl)
      return res.status(400).json({ error: 'Missing id or location' });

    // This GET is what increments the Unsplash download count
    await axios.get(downloadUrl, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
      timeout: 6000,
    });

    return res.json({ ok: true });
  } catch (err) {
    logger.error('Unsplash download trigger error:', err.message);
    return res.status(200).json({ ok: false }); // don’t break the UI if this fails
  }
});

module.exports = router;
