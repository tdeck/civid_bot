var crypto = require('crypto');

var LOGIN_WINDOW_MS = 60000;
var SHORT_SIG_LENGTH = 18;

function timestamp() {
  return '@' + Math.floor(Date.now() / LOGIN_WINDOW_MS).toString();
}

var Tokenizer = function(signing_key) {
  this.signing_key = signing_key;
};

Tokenizer.prototype.tokenize = function(username) {
  console.log(new Date());
  return this._sign(username + timestamp()) + username;
};

Tokenizer.prototype._sign = function(str) {
  var hasher = crypto.createHash('sha256');
  hasher.update(this.signing_key);
  hasher.update(str);
  return hasher.digest('base64').slice(0, SHORT_SIG_LENGTH)
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
};

module.exports = Tokenizer;
