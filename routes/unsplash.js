// routes/unsplash.js
const express = require('express');
const router = express.Router();
const {
  getRandomPhoto,
  triggerDownload,
} = require('../controllers/unsplashController');

router.get('/photos', getRandomPhoto);
router.get('/download', triggerDownload);

module.exports = router;
