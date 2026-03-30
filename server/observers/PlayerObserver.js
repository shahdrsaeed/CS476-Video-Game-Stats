class Observer {
  update(subject) {
    throw new Error('update() must be implemented by subclass');
  }
}

module.exports = Observer;