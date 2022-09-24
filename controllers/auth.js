const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { expressjwt: expressJwt } = require('express-jwt');
const _ = require('lodash');
const { OAuth2Client } = require('google-auth-library');

// const signup = (req, res) => {
//   // console.log('REQ BODY ON SIGNUP', req.body)
//   const { firstname, lastname, email, password } = req.body;

//   User.findOne({ email }).exec((err, user) => {
//     if (user) {
//       return res.status(400).json({
//         error: 'Email is already in use',
//       });
//     }
//   })
//   const newUser = new User({ firstname, lastname, email, password });

//   newUser.save((err, success) => {
//     if (err) {
//       console.log('SIGNUP ERROR', err);
//       return res.status(400).json({
//         error: err,
//       });
//     }
//     res.json({
//       message: 'Signup success! Please signin.',
//     });
//   })
// }

const { sendEmailWithNodemailer } = require('../helpers/email');

// Signup user and send email
const signup = (req, res) => {
  // console.log('REQ BODY ON SIGNUP', req.body)
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
          console.log('JWT VERIFY IN ACCOUNT ACTIVATION ERROR', err);
          return res.status(401).json({
            error: 'Expired link. Signup again',
          });
        }

        const { firstname, lastname, email, password } = jwt.decode(token);

        const user = new User({ firstname, lastname, email, password });

        user.save((err, user) => {
          if (err) {
            console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err);
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
  algorithms: ['HS256']
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

module.exports = {
  signup,
  accountActivation,
  signin,
  requireSignin,
  adminMiddleware,
  // forgotPassword,
  // resetPassword,
  // googleLogin,
};
