const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const plantSchema = new Schema(
  {
    common_name: {
      type: String,
      trim: true,
      required: true,
      max: 20,
    },
    botanical_name: {
      type: String,
      trim: true,
      required: false,
      max: 20,
    },
    sow_at: {
      type: Date,
      default: null,
      trim: true,
      required: false,
    },
    plant_at: {
      type: Date,
      default: null,
      trim: true,
      required: false,
    },
    harvest_at: {
      type: Date,
      default: null,
      trim: true,
      required: false,
    },
    harvest_to: {
      type: Date,
      default: null,
      trim: true,
      required: false,
    },
    fertilise: {
      type: String,
      // default: '',
      trim: true,
      required: false,
      max: 20,
    },
    fertiliser_type: {
      type: String,
      // is this a good idea? empty string or null?
      // default: '',
      trim: true,
      required: false,
      max: 20,
    },
    spacing: {
      type: String,
      trim: true,
      required: false,
      max: 20,
    },
    depth: {
      type: String,
      trim: true,
      required: false,
      max: 20,
    },
    notes: {
      type: String,
      trim: true,
      required: false,
      max: 240,
    },
    archived: {
      type: Boolean,
      default: false,
      trim: true,
      required: false,
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

const Plant = mongoose.model('Plant', plantSchema);

module.exports = Plant;
