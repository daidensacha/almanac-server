const { expressjwt: expressJwt } = require('express-jwt');
const Category = require('../models/category');

const create_category = async (req, res, next) => {
  const { category, description} = req.body;
  console.log('req.auth._id', req.auth._id);
  if (!category) {
    return res.status(400).send('No category provided');
  }
  try {
    const newCategory = await Category.create({
      category,
      description,
      created_by: req.auth._id,
    });
    res.status(201).send(newCategory);
  } catch (error) {
    console.log(error);
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
};

const get_all_categories = async (req, res, next) => {
  try {
    const allCategories = await Category.find({created_by: req.auth._id}).populate([
      {
        path: 'created_by',
        select: 'firstname lastname', // only return the Persons name
      },
    ]);
    res.status(200).send(allCategories);
  } catch (error) {
    console.log(error);
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
        error: 'Unauthorized: You can only view categories you created'
      });
    }

    res.status(200).send(category);
  } catch (error) {
    console.log(error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID',
      });
    }
    if (!category) {
      return res.status(404).json({
        error: 'Category not found',
      });
    }
    next(error);
  }
  next();
};

// const update_category_id = async (req, res, next) => {
//   const { id } = req.params;
//   console.log(id)
//   const { category, description } = req.body;
//   if (!id) {
//     return res.status(400).json({
//       error: 'No ID provided',
//     });
//   }
//   try {
//     const updatedCategory = await Category.findByIdAndUpdate(
//       id,
//       {
//         category,
//         description,
//         updatedAt: Date.now(),
//       },
//       { new: true },
//     );
//     if (updatedCategory.created_by != req.auth._id) {
//       return res.status(401).json({
//         error: 'Unauthorized: You can only update categories you created'
//       });
//     }
//     res.status(200).send(updatedCategory);
//   } catch (error) {
//     console.log(error);
//     if (error.name === 'CastError') {
//       return res.status(400).json({
//         error: 'Invalid ID',
//       });
//     }
//     if (!updatedCategory) {
//       return res.status(404).json({
//         error: 'Category not found',
//       });
//     }
//     if (error.name === 'ValidationError') {
//       return res.status(400).json({
//         error: error.message,
//       });
//     }
//     next(error);
//   }
//   next();
// };

const update_category_id = async (req, res, next) => {
  const { id } = req.params;
  console.log(id)
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
        error: 'Unauthorized: You can only update categories you created'
      });
    }
    updateCategory.category = category;
    updateCategory.description = description;
    updateCategory.updatedAt = Date.now();
    await updateCategory.save();
    res.status(200).send(updateCategory);
  } catch (error) {
    console.log(error);
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
        error: 'Unauthorized: You can only delete categories you created'
      });
    }
    res.status(200).send(deleteCategory);
  } catch (error) {
    console.log(error);
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
  delete_category_id,
};
