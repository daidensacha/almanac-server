// routes/event.js
const express = require('express');
const router = express.Router();

const { requireSignin, attachUserFromJwt } = require('../controllers/auth');
const event = require('../controllers/event'); // createEvent, listEvents, ...

router.get('/events', requireSignin, attachUserFromJwt, event.listEvents);
router.get('/event/:id', requireSignin, attachUserFromJwt, event.getEvent);
router.post(
  '/event/create',
  requireSignin,
  attachUserFromJwt,
  event.createEvent,
);
router.put(
  '/event/update/:id',
  requireSignin,
  attachUserFromJwt,
  event.updateEvent,
);
router.patch(
  '/event/archive/:id',
  requireSignin,
  attachUserFromJwt,
  event.archiveEvent,
);
router.delete(
  '/event/delete/:id',
  requireSignin,
  attachUserFromJwt,
  event.deleteEvent,
);

module.exports = router;
