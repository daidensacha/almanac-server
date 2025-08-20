// controllers/climate_zone.js
const axios = require('axios');
const logger = require('../utils/logger');

const get_climate_zone = async (req, res) => {
  const { latitude, longitude } = req.params;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: 'Missing latitude/longitude' });
  }

  const url = `http://climateapi.scottpinkelman.com/api/v1/location/${latitude}/${longitude}`;

  try {
    const { data } = await axios.get(url, {
      timeout: 6000,
      // optional: validateStatus: s => s >= 200 && s < 500,
    });

    // Defensive checks: the API sometimes changes shape or returns errors
    const rv = data?.return_values;
    if (!Array.isArray(rv) || rv.length === 0) {
      logger.error('Climate API unexpected response', { data });
      return res
        .status(502)
        .json({ error: 'Upstream climate API returned no data' });
    }

    // Keep the payload the client expects
    return res.status(200).json({ climateZone: data });
  } catch (err) {
    const status = err.response?.status || 500;
    logger.error('Climate API fetch failed', {
      status,
      message: err.message,
      data: err.response?.data,
    });
    // Send a compact error the client can handle
    return res.status(502).json({ error: 'Climate API request failed' });
  }
};

module.exports = { get_climate_zone };
