const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    category: {
      type: String,
      trim: true,
      required: true,
      max: 20,
    },
    description: {
      type: String,
      trim: true,
      required: false,
      max: 120,
    },
    created_by: {
      type: Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at', // Use `created_at` to store the created date
      updatedAt: 'updated_at', // and `updated_at` to store the last updated date
    },
  },
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
