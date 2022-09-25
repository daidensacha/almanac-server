const Event = require('../models/event');

const create_event = async (req, res, next) => {
  const {
    name,
    occurs_at,
    location,
    description,
    repeats,
    notes,
    category, // category_id selected from dropdown
    plant, // plant_id selected from dropdown
  } = req.body;
  console.log('req.auth._id', req.auth._id);
  // check for required fields
  if (!name || !occurs_at || !location || !description) {
    return res.status(400).json({
      error: 'Please enter required fields'});
  }
//   function occursAtToMonth(occurs_at) {
//     const month = new Date(this.occurs_at)
//       .toLocaleString('en-us', { month: 'long' })
//       .toLowerCase();
//   return month;
// }
  // const month = occurs_at;
  try {
    const newEvent = await Event.create({
      name,
      occurs_at,
      location,
      description,
      repeats,
      month: occurs_at, // how to add month name to the event?
      notes,
      category,
      plant,
      created_by: req.auth._id,
    });
    res.status(201).send(newEvent)
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Event already exists',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
};

const get_all_events = async (req, res, next) => {
  try {
    const allEvents = await Event.find({ created_by: req.auth._id }).populate([
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
        select: '-createdAt -updatedAt -__v', // exclude these fields
      },
    ]);
    res.status(200).send(allEvents);
  } catch (error) {
    console.log(error);
    if (!allEvents) {
      return res.status(404).json({
        error: 'No events found',
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

const get_event_id = async (req, res, next) => {
  const { id } = req.params;
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
        select: '-createdAt -updatedAt -__v', // exclude these fields
      },
    ]);
    if (event.created_by._id != req.auth._id) {
      return res.status(400).json({
        error: 'Unauthorized: You are not authorized to view this event',
      });
    }
    res.status(200).send(event);
  } catch (error) {
    console.log(error);
    if (!event) {
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

const update_event_id = async (req, res, next) => {
  const { id } = req.params;
  const {
    name,
    occurs_at,
    location,
    description,
    repeats,
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
    updatedEvent.name = name;
    updatedEvent.occurs_at = occurs_at;
    updatedEvent.location = location;
    updatedEvent.description = description;
    updatedEvent.repeats = repeats;
    updatedEvent.notes = notes;
    updatedEvent.category = category;
    updatedEvent.plant = plant;
    updatedEvent.updated_at = Date.now();
    await updatedEvent.save();
    res.status(200).send(updatedEvent);
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
  }
  catch (error) {
    console.log(error);
    if (!deletedEvent) {
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

};

module.exports = {
  create_event,
  get_all_events,
  get_event_id,
  update_event_id,
  delete_event_id,
};
