// controllers/user.js
const User = require('../models/user');
const logger = require('../utils/logger');
const {
  PASSWORD_REGEX,
  PASSWORD_MESSAGE,
} = require('@daidensacha/almanac-shared');

const read = async (req, res) => {
  try {
    // express-jwt puts the auth id on req.auth; you’re reading by :id param here
    const user = await User.findById(req.params.id).select(
      '-hashed_password -salt',
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json(user);
  } catch (err) {
    logger.error('USER READ ERROR', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

const updateUser = async (req, res) => {
  try {
    // Only allow the authenticated user to update themselves (or add an admin check upstream)
    const user = await User.findById(req.auth._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      firstname,
      lastname,
      show_location,
      latitude,
      longitude,
      koppen_geiger_zone,
      zone_description,
      password,
    } = req.body || {};

    // Required names
    if (!firstname)
      return res.status(422).json({ error: 'First name is required' });
    if (!lastname)
      return res.status(422).json({ error: 'Last name is required' });

    // Apply scalar updates
    user.firstname = firstname;
    user.lastname = lastname;

    if (typeof show_location === 'boolean') user.show_location = show_location;

    // Coerce lat/lon to numbers or null (so schema Number fields don’t get "")
    const toNumOrNull = v =>
      v === undefined || v === null || v === '' ? null : Number(v);

    const latNum = toNumOrNull(latitude);
    const lonNum = toNumOrNull(longitude);
    if (latNum !== undefined) user.latitude = latNum;
    if (lonNum !== undefined) user.longitude = lonNum;

    if (typeof koppen_geiger_zone === 'string')
      user.koppen_geiger_zone = koppen_geiger_zone;
    if (typeof zone_description === 'string')
      user.zone_description = zone_description;

    // Password (optional)
    if (password) {
      if (!PASSWORD_REGEX.test(password)) {
        return res.status(422).json({ error: PASSWORD_MESSAGE });
      }
      // trigger virtual setter -> will re-hash
      user.password = password;
    }

    const updated = await user.save();
    const safe = updated.toObject();
    delete safe.hashed_password;
    delete safe.salt;

    return res.json(safe);
  } catch (err) {
    logger.error('USER UPDATE ERROR', err);
    return res.status(500).json({ error: 'User update failed. Try again' });
  }
};

module.exports = {
  read,
  updateUser,
};
