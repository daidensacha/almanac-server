const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      trim: true,
      required: true,
      max: 20,
    },
    lastname: {
      type: String,
      trim: true,
      required: true,
      max: 20,
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    show_location: {
      type: Boolean,
      default: false,
    },
    latitude: {
      type: Number,
      trim: true,
      default: null,
    },
    longitude: {
      type: Number,
      trim: true,
      default: null,
    },
    koppen_geiger_zone: {
      type: String,
      trim: true,
      max: 3,
      default: '',
    },
    zone_description: {
      type: String,
      trim: true,
      default: '',
    },
    hashed_password: {
      type: String,
      required: true,
    },
    salt: String,
    role: {
      type: String,
      default: 'subscriber',
    },
    resetPasswordLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

// Virtual field
userSchema
  .virtual('password')
  .set(function (password) {
    // create a temporarity variable called _password
    this._password = password;
    // generate salt
    this.salt = this.makeSalt();
    // encryptPassword
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });

// Methods
userSchema.methods = {
  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  },

  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex');
    } catch (err) {
      return '';
    }
  },

  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + '';
  },
};

module.exports = mongoose.model('User', userSchema);
