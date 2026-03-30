// server/observers/PlayerSocketObserver.js
const Observer = require('./PlayerObserver');

class PlayerSocketObserver extends Observer {
  constructor(io) {
    super();
    this.io = io;
  }

  update(subject) {
    this.io.emit('playerUpdated', subject.player);
  }
}

module.exports = PlayerSocketObserver;