const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,20}$/;
const PASSWORD_MESSAGE =
  'Password must be 8–20 characters and include uppercase, lowercase, and a number.';

module.exports = {
  PASSWORD_REGEX,
  PASSWORD_MESSAGE,
};
