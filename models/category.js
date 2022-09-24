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
  { timestamps: true },
);

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
