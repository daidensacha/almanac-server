// src/controllers/unsplashController.js
const axios = require('axios');
const loggerRoot = require('../utils/logger');

/** In-memory TTL cache */
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 mins
const MAX_ENTRIES = 200;
const cache = new Map(); // Map<key, { value, expiresAt }>

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

exports.getRandomPhoto = async (req, res) => {
  const log = req.log || loggerRoot;
  try {
    const raw = (req.query.query || '').toString().trim();
    if (!raw) {
      log.warn({ query: req.query }, 'unsplash.photos missing query');
      return res.status(400).json({ error: 'Missing query' });
    }

    const fixed = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const cacheKey = `unsplash:${fixed.toLowerCase()}`;
    log.info({ raw, fixed, cacheKey }, 'unsplash.photos start');

    const cached = getCache(cacheKey);
    if (cached) {
      log.info({ cacheKey }, 'unsplash.photos cache hit');
      res.set('Cache-Control', 'public, max-age=3600');
      return res.json(cached);
    }

    log.info({ fixed }, 'unsplash.photos fetching upstream');
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
      download_location: links?.download_location || null,
      author: user
        ? {
            name: user.name,
            username: user.username,
            profile: user.links?.html,
          }
        : null,
    };

    log.info(
      { id, hasUrl: !!payload.url, author: payload.author?.username || null },
      'unsplash.photos upstream ok',
    );

    setCache(cacheKey, payload);
    res.set('Cache-Control', 'public, max-age=3600');
    return res.json(payload);
  } catch (err) {
    const status = err.response?.status || 500;
    log.error(
      { status, msg: err.message, data: err.response?.data || null },
      'unsplash.photos error',
    );

    if ([401, 403, 404, 429].includes(status)) {
      res.set('Cache-Control', 'public, max-age=600');
      return res
        .status(200)
        .json({ url: null, alt: 'fallback', query: req.query.query });
    }
    return res.status(status).json({ error: 'Unsplash fetch failed' });
  }
};

exports.triggerDownload = async (req, res) => {
  const log = req.log || loggerRoot;
  try {
    const { id, location } = req.query;
    let downloadUrl = location;

    log.info({ id, hasLocation: !!location }, 'unsplash.download start');

    if (!downloadUrl && id) {
      log.info({ id }, 'unsplash.download resolving by id');
      const info = await axios.get(`https://api.unsplash.com/photos/${id}`, {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      });
      downloadUrl = info.data?.links?.download_location;
      log.info(
        { id, hasDownloadLocation: !!downloadUrl },
        'unsplash.download resolved',
      );
    }

    if (!downloadUrl) {
      log.warn({ id, location }, 'unsplash.download missing id/location');
      return res.status(400).json({ error: 'Missing id or location' });
    }

    await axios.get(downloadUrl, {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
      timeout: 6000,
    });

    log.info({ id }, 'unsplash.download credited');
    return res.json({ ok: true });
  } catch (err) {
    log.error(
      { msg: err.message, data: err.response?.data || null },
      'unsplash.download error',
    );
    return res.status(200).json({ ok: false }); // best-effort
  }
};
