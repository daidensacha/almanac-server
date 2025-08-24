const express = require('express');
const router = express.Router();

router.get('/ip-locate', async (req, res) => {
  try {
    // Trust proxy if you’re behind one (set app.set('trust proxy', true) in server.js)
    const ip =
      (req.headers['x-forwarded-for'] || '').split(',').shift()?.trim() ||
      req.socket?.remoteAddress ||
      '';

    const url = `http://ip-api.com/json/${encodeURIComponent(
      ip,
    )}?fields=status,message,lat,lon,city,country`;
    const r = await fetch(url);
    const j = await r.json();
    if (j.status !== 'success') {
      return res
        .status(200)
        .json({ lat: null, lon: null, city: null, country: null });
    }
    return res.json({
      lat: j.lat,
      lon: j.lon,
      city: j.city,
      country: j.country,
    });
  } catch (e) {
    return res
      .status(200)
      .json({ lat: null, lon: null, city: null, country: null });
  }
});

module.exports = router;
