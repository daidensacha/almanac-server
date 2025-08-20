const mongoose = require('mongoose');
const { expressjwt: expressJwt } = require('express-jwt');
const Category = require('../models/category');
const logger = require('../utils/logger');

const create_category = async (req, res, next) => {
  const { category, description } = req.body;
  logger.debug('req.auth._id', req.auth._id);
  if (!category) {
    return res.status(400).send('No category provided');
  }
  try {
    const newCategory = await Category.create({
      category,
      description,
      created_by: req.auth._id,
    });
    res.status(201).json({ newCategory });
  } catch (error) {
    logger.error(error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Category already exists',
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

const get_all_categories = async (req, res, next) => {
  try {
    const allCategories = await Category.find({
      $and: [{ created_by: req.auth._id }, { archived: { $eq: false } }],
    }).populate([
      {
        path: 'created_by',
        select: 'firstname lastname', // only return the Persons name
      },
    ]);
    res.status(200).json({ allCategories });
  } catch (error) {
    logger.error(error);
    if (!allCategories) {
      return res.status(404).json({
        error: 'No categories found',
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

const get_category_id = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).send('No ID provided');
  }
  try {
    const category = await Category.findById(id).populate([
      {
        path: 'created_by',
        select: 'firstname lastname', // only return the Persons name
      },
    ]);
    if (category.created_by._id != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only view categories you created',
      });
    }

    res.status(200).json({ category });
  } catch (error) {
    logger.error(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
      });
    }
    // if (!category) {
    //   return res.status(404).json({
    //     error: 'Category not found',
    //   });
    // }
    next(error);
  }
  next();
};

const update_category_id = async (req, res, next) => {
  const { id } = req.params;
  const { category, description } = req.body;
  if (!id) {
    return res.status(400).json({
      error: 'No ID provided',
    });
  }
  try {
    // use findById so I can add validation for the category owner
    const updateCategory = await Category.findById(id);
    if (updateCategory.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only update categories you created',
      });
    }
    updateCategory.category = category;
    updateCategory.description = description;
    updateCategory.updated_at = Date.now();
    await updateCategory.save();
    res.status(200).json({ updateCategory });
  } catch (error) {
    logger.error(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
      });
    }
    if (!updateCategory) {
      return res.status(404).json({
        error: 'Category not found',
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

const archive_category_id = async (req, res, next) => {
  const { id } = req.params;
  const { archived } = req.body;
  if (!id) {
    return res.status(400).json({
      error: 'No ID provided',
    });
  }
  try {
    // use findById so I can add validation for the category owner
    const archiveCategory = await Category.findById(id);
    if (archiveCategory.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only archive categories you created',
      });
    }
    archiveCategory.archived = archived;
    archiveCategory.updated_at = Date.now();
    await archiveCategory.save();
    res.status(200).json({ archiveCategory });
  } catch (error) {
    logger.error(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
      });
    }
    if (!archiveCategory) {
      return res.status(404).json({
        error: 'Category not found',
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

const delete_category_id = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({
      error: 'No ID provided',
    });
  }
  try {
    const deleteCategory = await Category.findById(id);
    if (deleteCategory.created_by != req.auth._id) {
      return res.status(401).json({
        error: 'Unauthorized: You can only delete categories you created',
      });
    }
    await deleteCategory.remove();
    res.status(200).json({ deleteCategory });
  } catch (error) {
    logger.error(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
      });
    }
    if (!deleteCategory) {
      return res.status(404).json({
        error: 'Category not found',
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
  create_category,
  get_all_categories,
  get_category_id,
  update_category_id,
  archive_category_id,
  delete_category_id,
};
