const Event = require('../models/event');

const create_event = async (req, res, next) => {
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
  // console.log('req.auth._id', req.auth._id);
  // check for required fields
  if (!event_name || !occurs_at || !category || !plant) {
    return res.status(400).json({
      error: 'Please enter required fields',
    });
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
    res.status(201).json({ newEvent });
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Event already exists',
      });
    }
    if (error.event_name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
  next();
};

const get_all_events = async (req, res, next) => {
  console.log(req.headers);
  try {
    const allEvents = await Event.find({
      $and: [{ created_by: req.auth._id }, { archived: { $eq: false } }],
    }).populate([
      {
        path: 'created_by', // reference to the User model
        select: 'firstname lastname', // only return the firstname and lastname
      },
      {
        path: 'category', // reference to the Category model
        select: 'category description', // only return the category and description
      },
      {
        path: 'plant', // reference to the Plant model
        model: 'Plant', // return the model fields
        select: '-created_at -created_at -__v', // exclude these fields
      },
    ]);
    res.status(200).json({ allEvents });
  } catch (error) {
    console.log(error);
    if (!allEvents) {
      return res.status(404).json({
        error: 'No events found',
      });
    }
    if (error.event_name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
  next();
};

const get_event_id = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    return res.status(400).json({
      error: 'No event id provided',
    });
  }
  try {
    const event = await Event.findById(id).populate([
      {
        path: 'created_by', // reference to the User model
        select: 'firstname lastname', // only return the firstname and lastname
      },
      {
        path: 'category', // reference to the Category model
        select: 'category description', // only return the category and description
      },
      {
        path: 'plant', // reference to the Plant model
        model: 'Plant', // return the model fields
        select: '-created_at -created_at -__v', // exclude these fields
      },
    ]);
    if (event.created_by._id != req.auth._id) {
      return res.status(400).json({
        error: 'Unauthorized: You are not authorized to view this event',
      });
    }
    res.status(200).json({ event });
  } catch (error) {
    console.log(error);
    if (!event) {
      return res.status(404).json({
        error: 'No event found',
      });
    }
    if (error.event_name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
  next();
};

const update_event_id = async (req, res, next) => {
  const { id } = req.params;
  console.log(req.params.id);
  console.log(req.body);
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
  if (!id) {
    return res.status(400).json({
      error: 'No event id provided',
    });
  }
  try {
    const updatedEvent = await Event.findById(id);
    if (updatedEvent.created_by != req.auth._id) {
      return res.status(400).json({
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
    res.status(200).json({ updatedEvent });
  } catch (error) {
    console.log(error);
    if (!updatedEvent) {
      return res.status(404).json({
        error: 'No event found',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
  next();
};

const archive_event_id = async (req, res, next) => {
  const { id } = req.params;
  const { archived } = req.body;
  if (!id) {
    return res.status(400).json({
      error: 'No event id provided',
    });
  }
  try {
    const archivedEvent = await Event.findById(id);
    if (archivedEvent.created_by != req.auth._id) {
      return res.status(400).json({
        error: 'Unauthorized: You are not authorized to archive this event',
      });
    }
    archivedEvent.archived = archived;
    archivedEvent.updated_at = Date.now();
    await archivedEvent.save();
    res.status(200).json({ archivedEvent });
  } catch (error) {
    console.log(error);
    if (!archivedEvent) {
      return res.status(404).json({
        error: 'No event found',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
  next();
};

const delete_event_id = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      error: 'No event id provided',
    });
  }
  try {
    const deletedEvent = await Event.findById(id);
    if (deletedEvent.created_by != req.auth._id) {
      return res.status(400).json({
        error: 'Unauthorized: You are not authorized to delete this event',
      });
    }
    await deletedEvent.remove();
    res.status(200).send(deletedEvent);
  } catch (error) {
    console.log(error);
    if (!deletedEvent) {
      return res.status(404).json({
        error: 'No event found',
      });
    }
    if (error.event_name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
  next();
};

module.exports = {
  create_event,
  get_all_events,
  get_event_id,
  update_event_id,
  archive_event_id,
  delete_event_id,
};
