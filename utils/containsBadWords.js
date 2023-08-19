const swearjar = require("swearjar");

module.exports = function containsBadWords(message) {
  return swearjar.profane(message);
};
