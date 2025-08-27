// routes/plant.js
const express = require('express');
const router = express.Router();

const { requireSignin, attachUserFromJwt } = require('../controllers/auth');
const plant = require('../controllers/plant'); // must export: list, getOne, create, update, archive, remove

// List current user's (optionally archived) plants
router.get('/plants', requireSignin, attachUserFromJwt, plant.listPlants);

// Get one plant (scoped to current user)
router.get('/plant/:id', requireSignin, attachUserFromJwt, plant.getPlant);

// Create plant (created_by comes from req.user._id)
router.post(
  '/plant/create',
  requireSignin,
  attachUserFromJwt,
  plant.createPlant,
);

// Update plant (scoped to current user)
router.put(
  '/plant/update/:id',
  requireSignin,
  attachUserFromJwt,
  plant.updatePlant,
);

// Archive / unarchive
router.patch(
  '/plant/archive/:id',
  requireSignin,
  attachUserFromJwt,
  plant.archivePlant,
);

// Hard delete (if you keep it)
router.delete(
  '/plant/delete/:id',
  requireSignin,
  attachUserFromJwt,
  plant.deletePlant,
);

// const logger = require('../utils/logger');
// router.get('/plants', requireSignin, attachUserFromJwt, (req, _res, next) => {
//   logger.info({ user: req.user?._id }, 'plants route after auth');
//   next();
// }, plant.list);

module.exports = router;

// // src/routes/plant.js
// const express = require('express');
// const router = express.Router();
// const {
//   createPlant,
//   listPlants,
//   getPlant,
//   updatePlant,
//   archivePlant,
//   deletePlant,
// } = require('../controllers/plant');

// // Order matters a little: list first, then id-specific
// router.get('/plants', listPlants);
// router.get('/plant/:id', getPlant);
// router.post('/plant/create', createPlant);
// router.put('/plant/update/:id', updatePlant);
// router.patch('/plant/archive/:id', archivePlant);
// router.delete('/plant/delete/:id', deletePlant);

// module.exports = router;
