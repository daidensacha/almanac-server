const express = require('express');
const router = express.Router();

//  Import controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const { read, updateUser } = require('../controllers/user');

// const { userUpdateValidator } = require('../validators/auth');

const { runValidation } = require('../validators');

// @route   GET api/user
router.get('/user/:id', requireSignin, read);
router.put('/user/update', requireSignin, runValidation, updateUser);
router.put('/admin/update', requireSignin, adminMiddleware, runValidation, updateUser);


module.exports = router;