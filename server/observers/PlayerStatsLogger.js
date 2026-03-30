// server/observers/PlayerStatsLogger.js
const Observer = require('./PlayerObserver');

class PlayerStatsLogger extends Observer {
  update(subject) {
    console.log('Player stats updated:', subject.player.stats);
  }
}

module.exports = PlayerStatsLogger;