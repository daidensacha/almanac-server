// routes/event.js
const express = require('express');
const router = express.Router();
const { requireSignin, adminMiddleware } = require('../controllers/auth');
const {
  create_event,
  get_all_events, // personal scope
  get_event_id,
  update_event_id,
  archive_event_id,
  delete_event_id,
  listEvents, // admin-wide
} = require('../controllers/event');

// Create
router.post('/event/create', requireSignin, create_event);

// PERSONAL list (this user only)
router.get('/events', requireSignin, get_all_events);

// ADMIN list (all, filterable)
router.get('/admin/events', requireSignin, adminMiddleware, listEvents);

// Read one
router.get('/event/:id', requireSignin, get_event_id);

// Update
router.put('/event/update/:id', requireSignin, update_event_id);

// Archive
router.patch('/event/archive/:id', requireSignin, archive_event_id);

// Delete
router.delete('/event/delete/:id', requireSignin, delete_event_id);

module.exports = router;
