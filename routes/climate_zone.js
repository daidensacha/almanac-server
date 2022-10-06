const express = require('express');
const router = express.Router();

const { get_climate_zone } = require('../controllers/climate_zone');

const { requireSignin } = require('../controllers/auth');

router.get('/climate-zone/:latitude/:longitude', get_climate_zone);
module.exports = router;