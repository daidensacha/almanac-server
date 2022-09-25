const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// function occursAtToMonth() {
//   const month = new Date()
//     .toLocaleString('en-us', { month: 'long' })
//     .toLowerCase();
//   return month;
// }

const eventSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      max: 20,
    },
    description: {
      type: String,
      trim: true,
      required: true,
      max: 120,
    },
    location: {
      type: String,
      trim: true,
      required: true,
      max: 120,
    },
    repeats: {
      type: String,
      trim: true,
      required: false,
      max: 20,
    },
    occurs_at: {
      type: Date,
      trim: true,
      required: true,
    },
    month: {
      type: String,
      trim: true,
      required: false,
      // default: occursAtToMonth(),
    },
    notes: {
      type: String,
      trim: true,
      required: false,
      max: 120,
    },
    created_by: {
      type: Schema.ObjectId,
      ref: 'User',
    },
    category: {
      type: Schema.ObjectId,
      ref: 'Category',
    },
    plant: {
      type: Schema.ObjectId,
      ref: 'Plant',
    },
  },
  {
    timestamps: {
      createdAt: 'created_at', // Use `created_at` to store the created date
      updatedAt: 'updated_at', // and `updated_at` to store the last updated date
    },
  },
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
