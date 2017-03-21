import * as CONSTANTS from './constants';
import * as utils from './utils';

class Passenger {
  constructor() {
    this.host = utils.createEmptyHost();
    this.subjects = {};
    this.queue = [];

    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.setHostAsConnected = this.setHostAsConnected.bind(this);

    this.addEventHandlers();
    this.waitForHandshake();
  }

  addEventHandlers() {
    window.addEventListener(CONSTANTS.MESSAGE_EVENT_NAME, this.handleIncomingMessage);
  }

  handleIncomingMessage(event) {
    const { topic, data, source, sourceOrigin } = utils.retrieveMessageFromEvent(event);
    const { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners)) {
      return;
    }

    listeners.forEach((listener) => {
      if (!this.isMatchingOrigin(sourceOrigin, topic)) {
        return;
      }

      const message = { topic, source, sourceOrigin, data };

      listener.callback(message);
    });
  }

  isMatchingOrigin(sourceOrigin, topic) {
    const { origin: hostOrigin } = this.host;
    const isMatching = sourceOrigin === hostOrigin || utils.isHandshake(topic);

    return isMatching;
  }

  postMessageToHost(topic, data) {
    const { source, origin: targetOrigin } = this.host;
    const message = utils.buildMessage(topic, data);

    source.postMessage(message, targetOrigin);
  }

  waitForHandshake() {
    this.on(CONSTANTS.HANDSHAKE_TOPIC, this.setHostAsConnected);
  }

  sendBackHandshake() {
    this.postMessageToHost(CONSTANTS.BACK_HANDSHAKE_TOPIC);
  }

  setHostAsConnected(message) {
    this.off(CONSTANTS.HANDSHAKE_TOPIC);
    this.host = utils.createHostFromMessage(message);
    this.sendBackHandshake();
    this.deliverQueuedMessaged();
  }

  addMessageToQueue(message) {
    this.queue.push(message);
  }

  deliverQueuedMessaged() {
    this.queue.forEach(this.postMessage, this);
    this.queue.length = 0;
  }

  post(topic, data) {
    const message = { topic, data };

    this.postMessage(message);
  }

  postMessage(message) {
    const { topic, data } = message;

    if (!this.isHostConnected()) {
      this.addMessageToQueue(message);

      return;
    }

    this.postMessageToHost(topic, data);
  }

  isHostConnected() {
    return this.host.connected;
  }

  on(topic, callback) {
    const listener = { topic, callback };

    this.subjects[topic] = this.subjects[topic] || [];
    this.subjects[topic].push(listener);

    return () => this.off(topic, callback);
  }

  off(topic, callback) {
    const fn = callback ? this.offTopicCallback : this.offTopics;

    return fn.call(this, topic, callback);
  }

  offTopics(topic) {
    delete this.subjects[topic];
  }

  offTopicCallback(topic, callback) {
    let { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners) || !listeners.length) {
      return;
    }

    listeners = listeners.filter(listener => (
      listener.callback !== callback
    ));

    this.subjects[topic] = listeners;
  }
}

export default Passenger;
