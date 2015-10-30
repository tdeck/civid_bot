var crypto = require('crypto');

var LOGIN_WINDOW_MS = 60000;
var SHORT_SIG_LENGTH = 18;

var signing_key = process.env.SIGNING_KEY;

function sign(str) {
  var hasher = crypto.createHash('sha256');
  hasher.update(signing_key);
  hasher.update(str);
  return hasher.digest('base64').slice(0, SHORT_SIG_LENGTH);
}
  
function timestamp() {
  return '@' + Math.floor(Date.now() / LOGIN_WINDOW_MS).toString();
}

module.exports.tokenize = function(username) {
  return sign(username + timestamp()) + username;
};
