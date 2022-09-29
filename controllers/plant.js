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
  // console.log('req.auth._id', req.auth._id);
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
  next();
};

const get_all_plants = async (req, res, next) => {
  // console.log('req.auth._id', req.auth._id);
  try {
    // Only get plants created by the logged in user, & those that are not archived
    const allPlants = await Plant.find({$and:[{ created_by: req.auth._id },{archived:{$eq:false}}]}).populate([
      {
        path: 'created_by',
        select: 'firstname lastname', // only return the Persons name
      },
    ]);
    res.status(200).json({allPlants});
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
  next();
};

const get_plant_id = async (req, res, next) => {
  // console.log('req.auth._id', req.auth._id);
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
  console.log('reqBody', req.body);
  try {
    const updatedPlant = await Plant.findById(id);
    if (updatedPlant.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only update plants you created',
      });
    }
    updatedPlant.common_name = common_name;
    updatedPlant.botanical_name = botanical_name;
    updatedPlant.sow_at = sow_at;
    updatedPlant.plant_at = plant_at;
    updatedPlant.harvest_at = harvest_at;
    updatedPlant.harvest_to = harvest_to;
    updatedPlant.fertilise = fertilise;
    updatedPlant.fertiliser_type = fertiliser_type;
    updatedPlant.spacing = spacing;
    updatedPlant.depth = depth;
    updatedPlant.notes = notes;
    updatedPlant.updated_at = Date.now();
    await updatedPlant.save();
    res.status(200).json({updatedPlant});
  } catch (error) {
    console.log(error);
    if (!updatedPlant) {
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

const archive_plant_id_ = async (req, res, next) => {
  const { id } = req.params;
  const { archived } = req.body;
  console.log('archived', archived);
  console.log('id', id);
  try {
    const archivedPlant = await Plant.findById(id);
    if (archivedPlant.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only remove plants you created',
      });
    }
    archivedPlant.archived = archived;
    archivedPlant.updated_at = Date.now();
    await archivedPlant.save();
    res.status(200).json({archivedPlant});
  } catch (error) {
    console.log(error);
    if (!archivedPlant) {
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

const delete_plant_id = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      error: 'No ID provided',
    });
  }
  try {
    const plant = await Plant.findById(id);
    if (plant.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only delete plants you created',
      });
    }
    await plant.remove();
    res.status(200).json({plant});
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
  archive_plant_id_,
  delete_plant_id,
};
