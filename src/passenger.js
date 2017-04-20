import * as CONSTANTS from './constants';
import * as utils from './utils';

class Passenger {
  constructor(config = CONSTANTS.DEFAULT_PASSENGER_CONFIG) {
    this.config = { ...CONSTANTS.DEFAULT_PASSENGER_CONFIG, ...config };

    this.host = utils.createEmptyHost();
    this.subjects = {};
    this.queue = [];

    this.debug('Starting new Passenger instance');

    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
    this.handleFrameUnload = this.handleFrameUnload.bind(this);
    this.setHostAsConnected = this.setHostAsConnected.bind(this);

    this.addEventHandlers();
    this.waitForHandshake();
  }

  addEventHandlers() {
    window.addEventListener(CONSTANTS.MESSAGE_EVENT_NAME, this.handleIncomingMessage);
    window.addEventListener(CONSTANTS.UNLOAD_EVENT_NAME, this.handleFrameUnload);
  }

  handleFrameUnload() {
    this.debug('Frame is unloading it-self');

    this.post(CONSTANTS.CLIENT_DISCONNECTED_TOPIC);
  }

  handleIncomingMessage(event) {
    const { topic, data, source, sourceOrigin } = utils.retrieveMessageFromEvent(event);
    const { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners)) {
      this.debug(`Received message from host with "${topic}" topic but there are no listeners than can handle it`);

      return;
    }

    this.debug(`Received message from host with "${topic}" topic`);

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

    this.debug(`Sending message to host with "${topic}" topic`);

    source.postMessage(message, targetOrigin);
  }

  waitForHandshake() {
    this.debug('Waiting for host to send handshake...');

    this.on(CONSTANTS.HANDSHAKE_TOPIC, this.setHostAsConnected);
  }

  sendBackHandshake() {
    this.post(CONSTANTS.BACK_HANDSHAKE_TOPIC);
  }

  setHostAsConnected(message) {
    this.debug('Host was connected');

    this.off(CONSTANTS.HANDSHAKE_TOPIC);
    this.host = utils.createHostFromMessage(message);
    this.sendBackHandshake();
    this.deliverQueuedMessages();
  }

  addMessageToQueue(message) {
    this.debug(`Adding message with "${message.topic}" topic to queue`);

    this.queue.push(message);
  }

  deliverQueuedMessages() {
    if (this.queue.length < 1) {
      return;
    }

    this.debug('Delivering queued messages to host');

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

    this.debug(`Adding "${topic}" topic listener`);

    return this;
  }

  off(topic, callback) {
    const fn = callback ? this.offTopicCallback : this.offTopics;

    this.debug(`Removing "${topic}" topic listener`);

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

  debug(message) {
    const debugCallback = this.config.debugCallback;

    if (!this.config.debug || (typeof debugCallback !== 'function')) {
      return;
    }

    debugCallback(`Passenger: ${message}`);
  }
}

export default Passenger;
