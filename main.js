var mineflayer = require('mineflayer');
var tokenizer = require('./tokenizer');
var logger = require('bunyan').createLogger({name: 'civid-bot'});

var AFK_MS = 30000; // Do something to keep the bot connected every 30s
var LOGIN_PAGE = 'http://id.civlabs.com/in/';

var signing_key = process.env.SIGNING_KEY;

var bot = mineflayer.createBot({
  host: 'mc.civcraft.co',
  username: process.env.MC_USER,
  password: process.env.MC_PASS,
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
  if (rawMsg.extra.length != 1) return;
  var extra = rawMsg.extra[0];

  logger.info('Message:', rawMsg);

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
  logger.info('Starting keepBusy().');
  setInterval(function() {
    logger.info('Sending an inventory click.');
    bot.clickWindow(0, 0, 0, function(err) {
      if (err) throw err;
    });
  }, AFK_MS);
}
