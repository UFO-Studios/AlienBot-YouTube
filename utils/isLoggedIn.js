const db = require("../db.json");

module.exports = function isLoggedIn() {
  if (!db.tokens) {
    return "/auth";
  } else {
    return "/main";
  }
};
