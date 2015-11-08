var mineflayer = require('mineflayer'),
  Tokenizer = require('./tokenizer'),
  logger = require('bunyan').createLogger({name: 'civid-bot'}),
  express = require('express')
  app = express();

var AFK_MS = 30000; // Do something to keep the bot connected every 30s
var LOGIN_PAGE = 'http://id.civlabs.com/in/';

var signing_key = process.env.SIGNING_KEY;
var mc_user = process.env.MC_USER;
var mc_pass = process.env.MC_PASS;
if (!signing_key || !mc_user || !mc_pass) throw new Error('Missing config');

var tokenizer = new Tokenizer(signing_key);

var bot = mineflayer.createBot({
  host: 'mc.civcraft.co',
  username: mc_user,
  password: mc_pass,
});

var spawned = false;
bot.on('spawn', function() {
  // This will also be called on death->respawn events, which we want to ignore
  logger.info('Spawned');
  if (spawned) return;
  spawned = true;
  keepBusy();
});

bot.on('chat', function(msg) {
  console.log('Chat:', message);
});

bot.on('message', function(rawMsg) {
  logTracked('message', 'Message:', rawMsg);

  if (!rawMsg.extra || rawMsg.extra.length != 1) return;
  var extra = rawMsg.extra[0];

  var match;
  if (
    extra.color === 'light_purple' &&
    (match = extra.text.match(/^From ([\w_]+?): (.+)$/))
  ) {
    var username = match[1];
    var message = match[2];
    handlePM(username, message);
  }
});

bot.on('kicked', function(reason) {
  logger.info('Kicked:', reason);
});

bot.on('end', function() {
  logger.info('Connection end');
});

function handlePM(username, message) {
  if (message.trim().toLowerCase() == 'id') {
    bot.whisper(username, "Your one-time login link:");
    bot.whisper(username, LOGIN_PAGE + tokenizer.tokenize(username));
    bot.whisper(username, "(it's good for 60 seconds)");
  } else {
    bot.whisper(username, "I won't dignify that with a response.");
  }
}

function keepBusy() {
  // Click a slot in the bot's inventory to keep it "active" according to AFKGC
  // Events that will keep the player from being kicked are listed here:
  // https://github.com/Kraken3/AFK-Player-GC/blob/master/src/com/github/Kraken3/AFKPGC/EventHandlers.java
  setInterval(function() {
    bot.clickWindow(0, 0, 0, function(err) {
      if (err) throw err;
      logTracked('keep_alive', 'Sent an inventory click');
    });
  }, AFK_MS);
}

// This both to logger.info and keeps track of the last time we saw an
// event in its category. We use these for the _status endpoint.
var trackedEvents = {};
function logTracked(name /*, ...info */) {
  var info = Array.prototype.slice.call(arguments);
  info.shift();
  logger.info.apply(logger, info);
  trackedEvents['last_' + name] = Date.now();
}

// For each tracked event, reports last_xxx timestamp and last_xxx_lag_seconds 
app.get('/_status', function(req, res) {
  var statusMsg = {};
  var now = Date.now();
  for (var key in trackedEvents) {
    var timestamp = trackedEvents[key];
    statusMsg[key] = timestamp;
    statusMsg[key + '_lag_seconds'] = (now - timestamp) / 1000;
  }
  return res.json(statusMsg);
});
app.listen(process.env.PORT || 5000);
