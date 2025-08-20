// importing packages
const express = require('express');
const logger = require('../utils/logger');
// const router = express.Router();
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));

const get_climate_zone = async (req, res) => {
  const latitude = req.params.latitude;
  const longitude = req.params.longitude;
  const url = `http://climateapi.scottpinkelman.com/api/v1/location/${latitude}/${longitude}`;
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  try {
    let response = await fetch(url);
    climateZone = await response.json();
    logger.debug('climateZone', climateZone);
    res.status(200).json({ climateZone });
  } catch (err) {
    logger.error(err);
    res.status(500).json({ msg: `Internal Server Error.` });
  }
};
module.exports = { get_climate_zone };
