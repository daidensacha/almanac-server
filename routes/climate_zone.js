// routes/climate_zone.js
const express = require('express');
const { get_climate_zone } = require('../controllers/climate_zone');
const { requireSignin } = require('../controllers/auth');

const router = express.Router();
router.get(
  '/climate-zone/:latitude/:longitude',
  requireSignin,
  get_climate_zone,
);
module.exports = router;
