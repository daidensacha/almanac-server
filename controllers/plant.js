const Plant = require('../models/plant');
const { expressjwt: expressJwt } = require('express-jwt');

const create_plant = async (req, res, next) => {
  const {
    common_name,
    botanical_name,
    sow_at,
    plant_at,
    harvest_at,
    harvest_to,
    fertilise,
    fertiliser_type,
    spacing,
    depth,
    notes,
  } = req.body;
  console.log('req.auth._id', req.auth._id);
  if (!common_name) {
    return res.status(400).send('Please enter a common name');
  }
  try {
    const newPlant = await Plant.create({
      common_name,
      botanical_name,
      sow_at,
      plant_at,
      harvest_at,
      harvest_to,
      fertilise,
      fertiliser_type,
      spacing,
      depth,
      notes,
      created_by: req.auth._id,
    });
    res.status(201).send(newPlant);
  } catch (error) {
    console.log(error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Plant already exists',
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

const get_all_plants = async (req, res, next) => {
  console.log('req.auth._id', req.auth._id);
  try {
    // Only get plants created by the logged in user
    const allPlants = await Plant.find({ created_by: req.auth._id }).populate([
      {
        path: 'created_by',
        select: 'firstname lastname', // only return the Persons name
      },
    ]);
    res.status(200).send(allPlants);
  } catch (error) {
    console.log(error);
    if (!allPlants) {
      return res.status(404).json({
        error: 'No plants found',
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

const get_plant_id = async (req, res, next) => {
  console.log('req.auth._id', req.auth._id);
  const { id } = req.params;
  try {
    const plant = await Plant.findById(id).populate([
      {
        path: 'created_by',
        select: 'firstname lastname', // only return the Persons name
      },
    ]);
    if (plant.created_by._id != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only view plants you created',
      });
    }
    res.status(200).send(plant);
  } catch (error) {
    console.log(error);
    if (!plant) {
      return res.status(404).json({
        error: 'Plant not found',
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

const update_plant_id = async (req, res, next) => {
  const { id } = req.params;
  const {
    common_name,
    botanical_name,
    sow_at,
    plant_at,
    harvest_at,
    harvest_to,
    fertilise,
    fertiliser_type,
    spacing,
    depth,
    notes,
  } = req.body;
  try {
    const plant = await Plant.findById(id);
    if (plant.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only update plants you created',
      });
    }
    plant.common_name = common_name;
    plant.botanical_name = botanical_name;
    plant.sow_at = sow_at;
    plant.plant_at = plant_at;
    plant.harvest_at = harvest_at;
    plant.harvest_to = harvest_to;
    plant.fertilise = fertilise;
    plant.fertiliser_type = fertiliser_type;
    plant.spacing = spacing;
    plant.depth = depth;
    plant.notes = notes;
    plant.updated_at = Date.now();
    await plant.save();
    res.status(200).send(plant);
  } catch (error) {
    console.log(error);
    if (!plant) {
      return res.status(404).json({
        error: 'Plant not found',
      });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: error.message,
      });
    }
    next(error);
  }
}


const delete_plant_id = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      error: 'No ID provided'});
  }
  try {
    const plant = await Plant.findById(id);
    if (plant.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only delete plants you created',
      });
    }
    await plant.remove();
    res.status(200).send(plant);
  } catch (error) {
    console.log(error);
    if (!plant) {
      return res.status(404).json({
        error: 'Plant not found',
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

module.exports = {
  create_plant,
  get_all_plants,
  get_plant_id,
  update_plant_id,
  delete_plant_id,
};
