const express = require('express');
const router = express.Router();

//  Import controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  create_plant,
  get_all_plants,
  get_plant_id,
  update_plant_id,
  delete_plant_id,
} = require('../controllers/plant');

//  Import validators
const { runValidation } = require('../validators');
// const { eventCreateValidator } = require('../validators/event');

// @route   GET api/event
router.post('/plant/create',requireSignin, create_plant);
router.get('/plants', requireSignin, get_all_plants);
router.get('/plant/:id', requireSignin, get_plant_id);
router.put('/plant/:id', requireSignin,   update_plant_id,);
router.delete('/plant/:id', requireSignin, delete_plant_id);

module.exports = router;