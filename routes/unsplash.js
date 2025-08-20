// routes/unsplash.js
const express = require('express');
const axios = require('axios');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/unsplash/photos?query=raspberries
router.get('/photos', async (req, res) => {
  try {
    const raw = (req.query.query || '').toString().trim();
    if (!raw) return res.status(400).json({ error: 'Missing query' });

    // normalize accents (safer queries)
    const fixed = raw.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

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
    res.json({
      url: urls.regular || urls.full || urls.small || null,
      alt: alt_description || description || fixed,
      query: fixed,
    });
  } catch (err) {
    const status = err.response?.status || 500;
    logger.error('Unsplash fetch error:', err.message);
    if (status === 403 || status === 404 || status === 429) {
      // return a soft-fail payload so the client can fallback
      return res
        .status(200)
        .json({ url: null, alt: 'fallback', query: req.query.query });
    }
    res.status(status).json({ error: 'Unsplash fetch failed' });
  }
});

module.exports = router;
