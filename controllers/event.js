const Event = require('../models/event');
const logger = require('../utils/logger');

const create_event = async (req, res) => {
  const {
    event_name,
    description,
    occurs_at,
    occurs_to,
    repeat_cycle,
    repeat_frequency,
    notes,
    category, // category_id selected from dropdown
    plant, // plant_id selected from dropdown
  } = req.body;

  if (!event_name || !occurs_at || !category || !plant) {
    return res.status(400).json({ error: 'Please enter required fields' });
  }

  try {
    const newEvent = await Event.create({
      event_name,
      occurs_at,
      description,
      repeat_cycle,
      repeat_frequency,
      occurs_to,
      notes,
      category,
      plant,
      created_by: req.auth._id,
    });
    return res.status(201).json({ newEvent });
  } catch (error) {
    logger.error(error);
    if (error.code === 11000)
      return res.status(400).json({ error: 'Event already exists' });
    if (error.name === 'ValidationError')
      return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'Failed to create event' });
  }
};

// PERSONAL: only this user's non-archived events
const get_all_events = async (req, res) => {
  try {
    const allEvents = await Event.find({
      created_by: req.auth._id,
      archived: false,
    })
      .populate([
        { path: 'created_by', select: 'firstname lastname' },
        { path: 'category', select: 'category description' },
        { path: 'plant', model: 'Plant', select: '-created_at -__v' },
      ])
      .sort({ occurs_at: 1 })
      .lean();

    return res.status(200).json({ allEvents });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Failed to load events' });
  }
};

const get_event_id = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'No event id provided' });

  try {
    const event = await Event.findById(id).populate([
      { path: 'created_by', select: 'firstname lastname' },
      { path: 'category', select: 'category description' },
      { path: 'plant', model: 'Plant', select: '-created_at -__v' },
    ]);

    if (!event) return res.status(404).json({ error: 'No event found' });

    if (String(event.created_by?._id) !== String(req.auth._id)) {
      return res
        .status(401)
        .json({
          error: 'Unauthorized: You are not authorized to view this event',
        });
    }

    return res.status(200).json({ event });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Failed to load event' });
  }
};

const update_event_id = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'No event id provided' });

  const {
    event_name,
    description,
    occurs_at,
    occurs_to,
    repeat_cycle,
    repeat_frequency,
    notes,
    category,
    plant,
  } = req.body;

  try {
    let updatedEvent = await Event.findById(id);
    if (!updatedEvent) return res.status(404).json({ error: 'No event found' });

    if (String(updatedEvent.created_by) !== String(req.auth._id)) {
      return res
        .status(401)
        .json({
          error: 'Unauthorized: You are not authorized to update this event',
        });
    }

    updatedEvent.event_name = event_name;
    updatedEvent.description = description;
    updatedEvent.occurs_at = occurs_at;
    updatedEvent.occurs_to = occurs_to;
    updatedEvent.repeat_cycle = repeat_cycle;
    updatedEvent.repeat_frequency = repeat_frequency;
    updatedEvent.notes = notes;
    updatedEvent.category = category;
    updatedEvent.plant = plant;
    updatedEvent.updated_at = Date.now();

    await updatedEvent.save();
    return res.status(200).json({ updatedEvent });
  } catch (error) {
    logger.error(error);
    if (error.name === 'ValidationError')
      return res.status(400).json({ error: error.message });
    return res.status(500).json({ error: 'Failed to update event' });
  }
};

const archive_event_id = async (req, res) => {
  const { id } = req.params;
  const { archived } = req.body; // boolean

  if (!id) return res.status(400).json({ error: 'No event id provided' });

  try {
    let archivedEvent = await Event.findById(id);
    if (!archivedEvent)
      return res.status(404).json({ error: 'No event found' });

    if (String(archivedEvent.created_by) !== String(req.auth._id)) {
      return res
        .status(401)
        .json({
          error: 'Unauthorized: You are not authorized to archive this event',
        });
    }

    archivedEvent.archived = Boolean(archived);
    archivedEvent.updated_at = Date.now();
    await archivedEvent.save();

    return res.status(200).json({ archivedEvent });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Failed to archive event' });
  }
};

const delete_event_id = async (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'No event id provided' });

  try {
    const deletedEvent = await Event.findById(id);
    if (!deletedEvent) return res.status(404).json({ error: 'No event found' });

    if (String(deletedEvent.created_by) !== String(req.auth._id)) {
      return res
        .status(401)
        .json({
          error: 'Unauthorized: You are not authorized to delete this event',
        });
    }

    await deletedEvent.deleteOne(); // prefer deleteOne over remove()
    return res.status(200).json({ deletedEvent });
  } catch (error) {
    logger.error(error);
    return res.status(500).json({ error: 'Failed to delete event' });
  }
};

const POPULATE_USER = {
  path: 'created_by',
  select: 'firstname lastname email _id',
};
const POPULATE_CATEGORY = { path: 'category', select: 'category description' };
const POPULATE_PLANT = {
  path: 'plant',
  model: 'Plant',
  select: '-created_at -__v',
};

// ADMIN: optional filters ?created_by=&archived=true|false
const listEvents = async (req, res) => {
  try {
    const { created_by, archived } = req.query;
    const q = {};
    if (created_by) q.created_by = created_by;
    if (typeof archived !== 'undefined') q.archived = archived === 'true';

    const allEvents = await Event.find(q)
      .populate([POPULATE_USER, POPULATE_CATEGORY, POPULATE_PLANT])
      .sort({ occurs_at: -1 })
      .lean();

    return res.json({ allEvents });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load events' });
  }
};

module.exports = {
  create_event,
  get_all_events,
  get_event_id,
  update_event_id,
  archive_event_id,
  delete_event_id,
  listEvents,
};
