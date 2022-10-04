const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// function occursAtTooccurs_to() {
//   const occurs_to = new Date()
//     .toLocaleString('en-us', { occurs_to: 'long' })
//     .toLowerCase();
//   return occurs_to;
// }

const eventSchema = new Schema(
  {
    event_name: {
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
    occurs_at: {
      type: Date,
      trim: true,
      required: true,
    },
    occurs_to: {
      type: Date,
      trim: true,
      required: false,
      default: null,
    },
    repeat_frequency: {
      type: Number,
      trim: true,
      required: false,
      max: 26,
    },
    repeat_cycle: {
      type: String,
      trim: true,
      required: false,
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
