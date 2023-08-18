const db = require("../db.json");

module.exports = async function isLoggedIn() {
  if (!db.tokens) {
    return "/auth";
  } else {
    return "/main";
  }
};
