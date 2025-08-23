// routes/admin.js
const express = require('express');
const router = express.Router();

const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { adminPing } = require('../controllers/admin');

router.get('/ping', requireSignin, adminMiddleware, adminPing);

module.exports = router;
