const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');
const { sendEmailWithNodemailer } = require('../helpers/email');
const logger = require('../utils/logger');

// Signup user and send email
const signup = (req, res) => {
  logger.debug('REQ BODY ON SIGNUP', req.body);
  const { firstname, lastname, email, password } = req.body;

  User.findOne({ email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: `${email} is already registered. Please signin.`,
      });
    }
    const token = jwt.sign(
      { firstname, lastname, email, password },
      process.env.JWT_ACCOUNT_ACTIVATION,
      { expiresIn: '10m' },
    );
    const emailData = {
      from: process.env.EMAIL_FROM, // GMAIL EMAIL FOR WHICH GENERATED APP PASSWORD
      to: email, // USER EMAIL (VALID EMAIL ADDRESS) WHO IS TRYING TO SIGNUP
      subject: 'Account Activation Link',
      html: `
                <h1>Please use the following link to activate your account</h1>
                <p>Hi ${firstname},</p>
                <p>The following activation link is valid for 10 minutes. If your unable to complete the activation in this timeframe, you will need to start the registration process again.</p>
                <p>${process.env.CLIENT_URL}/activate-account/${token}</p>
                <p>Best regards,</p>
                <p>Garden Almanac Team</p>
                <hr />
                <p>This email may contain sensitive information</p>
                <p>${process.env.CLIENT_URL}</p>
            `,
    };

    sendEmailWithNodemailer(req, res, emailData, email);
  });
};

// Activate user account
const accountActivation = (req, res) => {
  const { token } = req.body;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_ACCOUNT_ACTIVATION,
      function (err, decoded) {
        if (err) {
          logger.error('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
          return res.status(401).json({
            error: 'Expired link. Signup again',
          });
        }

        const { firstname, lastname, email, password } = jwt.decode(token);

        const user = new User({ firstname, lastname, email, password });

        user.save((err, user) => {
          if (err) {
            logger.error('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
            return res.status(401).json({
              error: 'Error saving user in database. Try signup again',
            });
          }
          return res.json({
            message: 'Signup success. Please signin.',
          });
        });
      },
    );
  } else {
    return res.json({
      message: 'Something went wrong. Try again.',
    });
  }
};

// Signin user
const signin = (req, res) => {
  const { email, password } = req.body;
  // check if user exists
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res
        .status(400)
        .json({ error: 'User with that email does not exist. Please signup.' });
    }
    // authenticate
    if (!user.authenticate(password)) {
      return res
        .status(400)
        .json({ error: 'Email and password do not match.' });
    }
    // generate a token and send to client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    const {
      _id,
      firstname,
      lastname,
      email,
      role,
      show_location,
      latitude,
      longitude,
      koppen_geiger_zone,
      zone_description,
    } = user;
    return res.json({
      token,
      user: {
        _id,
        firstname,
        lastname,
        email,
        role,
        show_location,
        latitude,
        longitude,
        koppen_geiger_zone,
        zone_description,
      },
    });
  });
};

// Require signin middleware
const requireSignin = expressJwt({
  secret: process.env.JWT_SECRET, // returns req.auth._id
  algorithms: ['HS256'],
});

// Admin middleware to check if user is admin // TODO: add admin role
const adminMiddleware = (req, res, next) => {
  User.findById({ _id: req.auth._id }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: 'User not found',
      });
    }
    if (user.role !== 'admin') {
      return res.status(400).json({
        error: 'Admin resource. Access denied.',
      });
    }
    req.profile = user;
    next();
  });
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};
    const user = await User.findOne({ email });
    if (!user) {
      // Don’t leak existence; return success message anyway
      return res.json({
        message: 'If that email exists, a reset link has been sent.',
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, {
      expiresIn: '10m',
    });

    user.resetPasswordLink = token;
    await user.save();

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password reset link',
      html: `
        <h1>Reset your password</h1>
        <p>Click the link below within 10 minutes:</p>
        <p>${process.env.CLIENT_URL}/reset-password/${token}</p>
      `,
    };

    return sendEmailWithNodemailer(req, res, emailData, email);
  } catch (err) {
    logger.error('FORGOT PASSWORD ERROR', err);
    return res.status(500).json({ error: 'Could not send reset link' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body || {};
    if (!token || !newPassword) {
      logger.warn({ route: 'resetPassword' }, 'Missing token or newPassword');
      return res.status(400).json({ error: 'Missing token or newPassword' });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_PASSWORD);
    } catch (e) {
      logger.info({ err: e }, 'Invalid or expired reset token');
      return res.status(401).json({ error: 'Reset link invalid or expired' });
    }

    const user = await User.findOne({ resetPasswordLink: token }).exec();
    if (!user) {
      logger.info({ token }, 'Reset link no longer valid');
      return res.status(400).json({ error: 'Reset link no longer valid' });
    }

    user.password = newPassword;
    user.resetPasswordLink = '';
    await user.save();

    logger.info({ userId: user._id }, 'Password reset success');
    return res.json({ message: 'Password has been reset. Please sign in.' });
  } catch (err) {
    logger.error({ err }, 'RESET PASSWORD ERROR');
    return res.status(500).json({ error: 'Server error resetting password' });
  }
};

// add to bottom exports:
module.exports = {
  signup,
  accountActivation,
  signin,
  requireSignin,
  adminMiddleware,
  forgotPassword, // <-- ensure these are exported
  resetPassword, // <--
};
