const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema(
  {
    category_name: {
      type: String,
      trim: true,
      required: true,
      maxlength: 20,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 240,
      default: '',
    },
    archived: {
      type: Boolean,
      default: false,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// JSON shape for backward-compat: also emit `.category`
function transformDoc(_doc, ret) {
  // emit legacy alias
  ret.category = ret.category_name;
  return ret;
}
CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: transformDoc,
});
CategorySchema.set('toObject', {
  virtuals: true,
  versionKey: false,
  transform: transformDoc,
});

// Helpful index: same user cannot have duplicate names case-insensitively
// (We still guard in controller; collation makes queries simpler)
CategorySchema.index(
  { created_by: 1, category_name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
);

module.exports = mongoose.model('Category', CategorySchema);
