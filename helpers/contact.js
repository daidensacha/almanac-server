const nodeMailer = require('nodemailer');
const logger = require('../utils/logger');

const contactMail = async (firstname, lastname, email, message) => {
  const transporter = await nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_TO,
      pass: process.env.GMAIL_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });

  const mailOption = {
    from: process.env.EMAIL_TO,
    to: process.env.EMAIL_TO,
    subject: 'Contact Form',
    html: `
      <h1>Contact Form</h1>
      <p>First Name: ${firstname}</p>
      <p>Last Name: ${lastname}</p>
      <p>Email: ${email}</p>
      <p>Message: ${message}</p>
    `,
  };
  try {
    await transporter.sendMail(mailOption);
    logger.info('Message sent');
    return Promise.resolve('Message sent');
  } catch (error) {
    logger.error(`Problem sending email: ${error}`);
    return Promise.reject(error);
  }
};
