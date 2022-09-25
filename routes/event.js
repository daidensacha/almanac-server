const express = require('express');
const router = express.Router();

//  Import controllers
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  create_event,
  get_all_events,
  get_event_id,
  update_event_id,
  delete_event_id,
} = require('../controllers/event');

//  Import validators
const { runValidation } = require('../validators');
// const { eventCreateValidator } = require('../validators/event');

// @route   GET api/event
router.post('/event/create', requireSignin, create_event);
router.get('/events', requireSignin, get_all_events);
router.get('/event/:id', requireSignin, get_event_id);
router.put('/event/:id', requireSignin, update_event_id);
router.delete('/event/:id', requireSignin, delete_event_id);

module.exports = router;
