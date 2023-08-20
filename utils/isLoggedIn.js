const db = require("../db.json");

module.exports = function isLoggedIn() {
  if (!db.tokens || !db.tokens.access_token || !db.tokens.refresh_token)
    return false;
  else return true;
};
