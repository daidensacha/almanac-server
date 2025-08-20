// /helpers/email.js
const nodeMailer = require('nodemailer');
const logger = require('../utils/logger');

exports.sendEmailWithNodemailer = (req, res, emailData, email) => {
  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_TO, // MAKE SURE THIS EMAIL IS YOUR GMAIL FOR WHICH YOU GENERATED APP PASSWORD
      pass: process.env.GMAIL_PASSWORD, // MAKE SURE THIS PASSWORD IS YOUR GMAIL APP PASSWORD WHICH YOU GENERATED EARLIER
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });

  return transporter
    .sendMail(emailData)
    .then(info => {
      logger.info(`Message sent: ${info.response}`);
      return res.json({
        message: `A verification email with instructions has been sent to ${email}`,
      });
    })
    .catch(err => {
      logger.error(`Problem sending email: ${err}`);
      return res.json({
        message: err.message,
      });
    });
};
