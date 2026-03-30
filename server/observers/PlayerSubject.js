// server/observers/PlayerSubject.js
class PlayerSubject {
  constructor(player) {
    this.player = player;      // Your player object
    this.observers = [];       // List of observers
  }

  attach(observer) {
    if (this.observers.includes(observer)) return;
    this.observers.push(observer);
  }

  detach(observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  notify() {
    this.observers.forEach(observer => observer.update(this));
  }

  // Business logic: update stats & notify observers
  async updateStats(newStats) {
    Object.assign(this.player.stats, newStats);

    // If using Mongoose
    if (typeof this.player.save === 'function') {
      await this.player.save();
    }

    this.notify();
  }
}

module.exports = PlayerSubject;