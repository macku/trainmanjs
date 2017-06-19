import * as CONSTANTS from './constants';
import * as utils from './utils';

class Trainman {
  constructor(frame = null, config = CONSTANTS.DEFAULT_TRAINMAN_CONFIG) {
    this.config = { ...CONSTANTS.DEFAULT_TRAINMAN_CONFIG, ...config };

    this.intervals = {};
    this.clients = {};
    this.subjects = {};
    this.queue = [];

    this.debug('Starting new Trainman instance');

    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);

    this.addEventHandlers();

    if (frame !== null) {
      const frames = Array.isArray(frame) ? frame : [frame];
      this.setClients(...frames);
    }
  }

  addClient(frame) {
    this.setClient(frame);

    return this;
  }

  post(clientId, topic, data) {
    if (!this.getClient(clientId)) {
      return this;
    }

    const message = { clientId, topic, data };
    this.postMessage(message);

    return this;
  }

  on(clientId, topic, callback) {
    const client = this.getClient(clientId);

    if (!client) {
      return this; // TODO: Check this
    }

    const { targetOrigin } = client;
    const listener = { targetOrigin, callback, clientId, topic };

    this.subjects[topic] = this.subjects[topic] || [];
    this.subjects[topic].push(listener);

    this.debug(`Adding "${topic}" topic listener for "${clientId}" client`);

    return this;
  }

  off(clientId, topic, callback) {
    let fn = this.offClient;

    if (callback) {
      fn = this.offClientTopicCallback;
    } else if (topic) {
      fn = this.offClientTopics;
    }

    this.debug(`Removing "${topic}" topic listener for "${clientId}" client`);

    fn.call(this, clientId, topic, callback);

    return this;
  }

  /**
   * @private
   */
  setClients(...frames) {
    Array.from(frames).map(frame => this.setClient(frame));
  }

  /**
   * @private
   */
  createClient(frame) {
    if (!utils.isElAnIframe(frame)) {
      throw new TypeError('Given frame is not an instance of the Iframe interface', frame);
    }

    const { src, id: clientId } = frame;
    const targetOrigin = utils.getOriginFromUri(src);
    const sourceOrigin = utils.getOrigin();

    return {
      clientId,
      sourceOrigin,
      targetOrigin,
      frame,
      connected: false
    };
  }

  /**
   * @private
   */
  setClient(frame) {
    const client = this.createClient(frame);

    if (this.clients[client.clientId]) {
      /* eslint-disable no-console */
      console.warn(`Client with given id ${client.clientId} is already registered`);
      /* eslint-enable no-console */
    }

    this.clients[client.clientId] = client;

    this.connectToClient(client.clientId);
  }

  /**
   * @private
   */
  addEventHandlers() {
    window.addEventListener(CONSTANTS.MESSAGE_EVENT_NAME, this.handleIncomingMessage);
  }

  /**
   * @private
   */
  handleIncomingMessage(event) {
    if (!utils.isEventMessageSupported(event)) {
      return;
    }

    const { topic, data, source, sourceOrigin } = utils.retrieveMessageFromEvent(event);
    const { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners)) {
      this.debug(`Received message with "${topic}" topic but there are no listeners than can handle it`);

      return;
    }

    this.debug(`Received message with "${topic}" topic`);

    listeners.forEach((listener) => {
      const { targetOrigin, callback } = listener;

      if (!utils.isMatchingOrigin(sourceOrigin, targetOrigin)) {
        return;
      }

      const message = { topic, source, sourceOrigin, data };

      callback(message);
    });
  }

  /**
   * @private
   */
  postMessageToClient(clientId, topic, data) {
    const { frame, targetOrigin } = this.getClient(clientId);
    const message = utils.buildMessage(topic, data);

    this.debug(`Sending message with "${topic}" topic to "${clientId}" client`);

    frame.contentWindow.postMessage(message, targetOrigin);
  }

  /**
   * @private
   */
  connectToClient(clientId, reconnect = false) {
    this.debug(`${reconnect ? 'Restarting' : 'Starting'} handshake polling for "${clientId}" client...`);

    this.startHandshakePolling(clientId);

    this.on(clientId, CONSTANTS.BACK_HANDSHAKE_TOPIC, this.setClientAsConnected.bind(this, clientId));

    if (!reconnect) {
      this.on(clientId, CONSTANTS.CLIENT_DISCONNECTED_TOPIC, this.setClientAsDisconnected.bind(this, clientId));
    }
  }

  /**
   * @private
   */
  startHandshakePolling(clientId) {
    this.intervals[clientId] = setInterval(this.sendHandshake.bind(this, clientId), this.config.handshakeInterval);
  }

  /**
   * @private
   */
  sendHandshake(clientId) {
    this.postMessageToClient(clientId, CONSTANTS.HANDSHAKE_TOPIC);
  }

  /**
   * @private
   */
  setClientAsConnected(clientId) {
    this.debug(`Client "${clientId}" was connected`);

    this.stopHandshakePooling(clientId);
    this.off(clientId, CONSTANTS.BACK_HANDSHAKE_TOPIC);

    const client = this.getClient(clientId);
    client.connected = true;

    this.deliverQueuedMessages(clientId);
  }

  /**
   * @private
   */
  setClientAsDisconnected(clientId) {
    const client = this.getClient(clientId);
    client.connected = false;

    this.debug(`Client ${clientId} was disconnected`);

    this.connectToClient(clientId, true);
  }

  /**
   * @private
   */
  addMessageToQueue(message) {
    const { clientId } = message;
    this.debug(`Adding message with "${message.topic}" topic to queue for "${clientId}" client`);

    this.queue[clientId] = this.queue[clientId] || [];

    const queue = this.queue[clientId];

    queue.push(message);
  }

  /**
   * @private
   */
  deliverQueuedMessages(clientId) {
    const messages = this.queue[clientId];

    if (!Array.isArray(messages) || messages.length < 1) {
      return;
    }

    this.debug(`Delivering queued messages to "${clientId}" client`);

    messages.forEach((message) => {
      this.postMessage(message);
    });

    messages.length = 0;
  }

  /**
   * @private
   */
  getClient(clientId) {
    if (!this.clients.hasOwnProperty(clientId)) {
      /* eslint-disable no-console */
      console.warn(`Given "${clientId}" client is not registered`);
      /* eslint-enable no-console */
    }

    return this.clients[clientId];
  }

  /**
   * @private
   */
  postMessage(message) {
    const { clientId, topic, data } = message;
    const client = this.getClient(clientId);

    if (!utils.isClientConnected(client)) {
      this.addMessageToQueue(message);

      return;
    }

    this.postMessageToClient(clientId, topic, data);
  }

  /**
   * @private
   */
  offClient(clientId) {
    Object.entries(this.subjects)
      .map(([topic, listeners]) => (
        [topic, listeners.filter(listener => listener.clientId !== clientId)]
      ))
      .forEach(([topic, listeners]) => {
        this.subjects[topic] = listeners;
      });
  }

  /**
   * @private
   */
  offClientTopics(clientId, topic) {
    let { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners) || listeners.length < 1) {
      return;
    }

    listeners = listeners.filter(listener => (
      listener.clientId !== clientId
    ));

    this.subjects[topic] = listeners;
  }

  /**
   * @private
   */
  offClientTopicCallback(clientId, topic, callback) {
    let { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners) || listeners.length < 1) {
      return;
    }

    listeners = listeners.filter(listener => (
      listener.clientId !== clientId && listener.callback !== callback
    ));

    this.subjects[topic] = listeners;
  }

  /**
   * @private
   */
  stopHandshakePooling(clientId) {
    const interval = this.intervals[clientId];

    if (!clientId) {
      return;
    }

    this.debug(`Handshake polling for "${clientId}" client was stopped`);

    clearTimeout(interval);
    delete this.intervals[clientId];
  }

  /**
   * @private
   */
  debug(message) {
    const debugCallback = this.config.debugCallback;

    if (!this.config.debug || (typeof debugCallback !== 'function')) {
      return;
    }

    debugCallback(`Trainman: ${message}`);
  }
}

export default Trainman;
