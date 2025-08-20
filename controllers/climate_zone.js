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

// importing packages
// const logger = require('../utils/logger');

// const get_climate_zone = async (req, res) => {
//   const { latitude, longitude } = req.params;
//   const url = `http://climateapi.scottpinkelman.com/api/v1/location/${latitude}/${longitude}`;

//   try {
//     const response = await fetch(url, {
//       method: 'GET',
//       headers: { 'Content-Type': 'application/json' },
//     });

//     const climateZone = await response.json();
//     logger.debug('climateZone', climateZone);

//     res.status(200).json({ climateZone });
//   } catch (err) {
//     logger.error(err);
//     res.status(500).json({ msg: 'Internal Server Error.' });
//   }
// };

// module.exports = { get_climate_zone };

// // importing packages
// const express = require('express');
// const logger = require('../utils/logger');
// // const router = express.Router();
// const fetch = (...args) =>
//   import('node-fetch').then(({ default: fetch }) => fetch(...args));

// const get_climate_zone = async (req, res) => {
//   const latitude = req.params.latitude;
//   const longitude = req.params.longitude;
//   const url = `http://climateapi.scottpinkelman.com/api/v1/location/${latitude}/${longitude}`;
//   const options = {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   };
//   try {
//     let response = await fetch(url);
//     climateZone = await response.json();
//     logger.debug('climateZone', climateZone);
//     res.status(200).json({ climateZone });
//   } catch (err) {
//     logger.error(err);
//     res.status(500).json({ msg: `Internal Server Error.` });
//   }
// };
// module.exports = { get_climate_zone };
