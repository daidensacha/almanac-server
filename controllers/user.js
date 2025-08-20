const User = require('../models/user');
const logger = require('../utils/logger');

const read = (req, res) => {
  logger.debug('req.user', req.user);
  const userId = req.params.id;
  User.findById(userId).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    user.hashed_password = undefined;
    user.salt = undefined;
    res.json(user);
  });
};

const updateUser = (req, res) => {
  logger.debug('UPDATE USER - req.auth', req.auth._id, 'UPDATE DATA', req.body);
  const {
    firstname,
    lastname,
    show_location,
    latitude,
    longitude,
    koppen_geiger_zone,
    zone_description,
    password,
  } = req.body;
  User.findOne({ _id: req.auth._id }, (err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }

    if (!firstname) {
      return res.status(400).json({
        error: 'First name is required',
      });
    } else {
      user.firstname = firstname;
    }
    if (!lastname) {
      return res.status(400).json({
        error: 'Last name is required',
      });
    } else {
      user.lastname = lastname;
      user.show_location = show_location;
      user.latitude = latitude;
      user.longitude = longitude;
      user.koppen_geiger_zone = koppen_geiger_zone;
      user.zone_description = zone_description;
    }
    const regularExpression = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z]).{8,20}$/;
    if (password) {
      if (!password.match(regularExpression)) {
        return res.status(400).json({
          error:
            'Password must be between 8-20 characters. Must contain at least one uppercase letter, one lowercase letter, and one number or special character.',
        });
      } else {
        user.password = password;
      }
    }
    user.save((err, updatedUser) => {
      if (err) {
        logger.error('USER UPDATE ERROR', err);
        return res.status(400).json({
          error: 'User update failed. Try again',
        });
      }
      updatedUser.hashed_password = undefined;
      updatedUser.salt = undefined;
      res.json(updatedUser);
    });
  });
};

module.exports = {
  read,
  updateUser,
};
