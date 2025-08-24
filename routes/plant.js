const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  create_plant,
  get_all_plants, // <-- user-scoped
  get_plant_id,
  update_plant_id,
  archive_plant_id,
  delete_plant_id,
  listPlants, // <-- admin/global
} = require('../controllers/plant');

// Create
router.post('/plant/create', requireSignin, create_plant);

// USER-SCOPED listing (subscriber & admin see only their own here)
router.get('/plants', requireSignin, get_all_plants);

// ADMIN listing with filters
router.get('/admin/plants', requireSignin, adminMiddleware, listPlants);

// Read one
router.get('/plant/:id', requireSignin, get_plant_id);

// Update
router.put('/plant/update/:id', requireSignin, update_plant_id);

// Archive
router.patch('/plant/archive/:id', requireSignin, archive_plant_id);

// Delete
router.delete('/plant/delete/:id', requireSignin, delete_plant_id);

module.exports = router;
