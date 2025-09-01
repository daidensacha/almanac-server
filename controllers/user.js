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
    const user = await User.findById(req.auth._id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const {
      firstname,
      lastname,
      show_location, // legacy toggle
      locationPreference, // "profile" | "ip"
      coordsSource, // "auto" | "manual" (optional)
      latitude,
      longitude,
      koppen_geiger_zone,
      zone_description,
      password,
    } = req.body || {};

    // ────────────── Validation ──────────────
    if (!firstname)
      return res.status(422).json({ error: 'First name is required' });
    if (!lastname)
      return res.status(422).json({ error: 'Last name is required' });

    // ────────────── Basic fields ──────────────
    user.firstname = firstname;
    user.lastname = lastname;

    // ────────────── Preference ──────────────
    const wantsProfile =
      locationPreference === 'profile' ||
      (locationPreference == null && show_location === true);

    user.locationPreference = wantsProfile ? 'profile' : 'ip';
    user.show_location = wantsProfile; // keep legacy in sync

    // ────────────── Coordinates ──────────────
    const toNumOrNull = v =>
      v === undefined || v === null || v === '' ? null : Number(v);

    if (wantsProfile) {
      user.latitude = toNumOrNull(latitude);
      user.longitude = toNumOrNull(longitude);

      if (typeof koppen_geiger_zone === 'string')
        user.koppen_geiger_zone = koppen_geiger_zone;

      if (typeof zone_description === 'string')
        user.zone_description = zone_description;

      // Save how coords were obtained
      if (coordsSource === 'manual' || coordsSource === 'auto') {
        user.coordsSource = coordsSource;
      } else {
        user.coordsSource = 'auto';
      }
    } else {
      // In IP mode → clear
      user.latitude = null;
      user.longitude = null;
      user.koppen_geiger_zone = null;
      user.zone_description = null;
      user.coordsSource = null;
    }

    // ────────────── Password ──────────────
    if (password) {
      if (!PASSWORD_REGEX.test(password)) {
        return res.status(422).json({ error: PASSWORD_MESSAGE });
      }
      user.password = password; // virtual setter handles hashing
    }

    // ────────────── Save ──────────────
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

module.exports = { updateUser };

// const updateUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.auth._id);
//     if (!user) return res.status(404).json({ error: 'User not found' });

//     const {
//       firstname,
//       lastname,
//       show_location,
//       locationPreference, // 👈 new
//       coordsSource,// 👈 new
//       latitude,
//       longitude,
//       koppen_geiger_zone,
//       zone_description,
//       password,
//     } = req.body || {};

//     if (!firstname)
//       return res.status(422).json({ error: 'First name is required' });
//     if (!lastname)
//       return res.status(422).json({ error: 'Last name is required' });

//     user.firstname = firstname;
//     user.lastname = lastname;

//     // Normalise preference
//     if (locationPreference === 'profile' || locationPreference === 'ip') {
//       user.locationPreference = locationPreference;
//       user.show_location = locationPreference === 'profile'; // keep legacy in sync
//     } else if (typeof show_location === 'boolean') {
//       user.show_location = show_location;
//       user.locationPreference = show_location ? 'profile' : 'ip';
//     }

//     const toNumOrNull = v =>
//       v === undefined || v === null || v === '' ? null : Number(v);

//     const latNum = toNumOrNull(latitude);
//     const lonNum = toNumOrNull(longitude);

//     // Only keep coords if using profile mode
//     if (user.locationPreference === 'profile') {
//       if (latNum !== undefined) user.latitude = latNum;
//       if (lonNum !== undefined) user.longitude = lonNum;
//       if (typeof koppen_geiger_zone === 'string')
//         user.koppen_geiger_zone = koppen_geiger_zone;
//       if (typeof zone_description === 'string')
//         user.zone_description = zone_description;
//     } else {
//       user.latitude = null;
//       user.longitude = null;
//       user.koppen_geiger_zone = null;
//       user.zone_description = null;
//     }

//     // Password
//     if (password) {
//       if (!PASSWORD_REGEX.test(password)) {
//         return res.status(422).json({ error: PASSWORD_MESSAGE });
//       }
//       user.password = password;
//     }

//     const updated = await user.save();
//     const safe = updated.toObject();
//     delete safe.hashed_password;
//     delete safe.salt;

//     return res.json(safe);
//   } catch (err) {
//     logger.error('USER UPDATE ERROR', err);
//     return res.status(500).json({ error: 'User update failed. Try again' });
//   }
// };

module.exports = {
  read,
  updateUser,
};
