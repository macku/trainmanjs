import * as CONSTANTS from './constants';
import * as utils from './utils';

class Trainman {
  constructor(frames = [], config = CONSTANTS.DEFAULT_CONFIG) {
    this.config = { ...CONSTANTS.DEFAULT_CONFIG, ...config };

    this.intervals = {};
    this.clients = {};
    this.subjects = {};
    this.queue = [];

    this.handleIncomingMessage = this.handleIncomingMessage.bind(this);

    this.addEventHandlers();
    this.setClients(frames);
  }

  setClients(frames) {
    Array.from(frames).map(frame => this.setClient(frame));
  }

  createClient(frame) {
    if (!utils.isElAnIframe(frame)) {
      throw new TypeError('Given frame is not an instance of the Iframe interface', frame);
    }

    const { src: targetOrigin, id: clientId } = frame;
    const sourceOrigin = utils.getOrigin();

    return {
      clientId,
      sourceOrigin,
      targetOrigin,
      frame,
      connected: false
    };
  }

  setClient(frame) {
    const client = this.createClient(frame);

    if (this.clients[client.clientId]) {
      throw new TypeError(`Client with given id ${client.clientId} is already registered`);
    }

    this.clients[client.clientId] = client;

    this.connectToClient(client.clientId);
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
      if (!utils.isMatchingOrigin(sourceOrigin)) {
        return;
      }

      const message = { topic, source, sourceOrigin, data };

      listener.callback(message);
    });
  }

  postMessageToClient(clientId, topic, data) {
    const { frame, targetOrigin } = this.getClient(clientId);
    const message = utils.buildMessage(topic, data);

    frame.contentWindow.postMessage(message, targetOrigin);
  }

  connectToClient(clientId) {
    this.startHandshakePolling(clientId);

    this.on(clientId, CONSTANTS.BACK_HANDSHAKE_TOPIC, this.setClientAsConnected.bind(this, clientId));
  }

  startHandshakePolling(clientId) {
    this.intervals[clientId] = setInterval(this.sendHandshake.bind(this, clientId), this.config.HANDSHAKE_INTERVAL);
  }

  sendHandshake(clientId) {
    this.postMessageToClient(clientId, CONSTANTS.HANDSHAKE_TOPIC);
  }

  setClientAsConnected(clientId) {
    this.stopHandshakePooling(clientId);
    this.off(clientId, CONSTANTS.BACK_HANDSHAKE_TOPIC);

    const client = this.getClient(clientId);

    client.connected = true;

    this.deliverClientQueuedMessaged(clientId);
  }

  addMessageToQueue(clientId, message) {
    this.queue[clientId] = this.queue[clientId] || [];

    const queue = this.queue[clientId];

    queue.push(message);
  }

  deliverClientQueuedMessaged(clientId) {
    const messages = this.queue[clientId];

    if (!Array.isArray(messages) || !messages.length) {
      return;
    }

    messages.forEach((message) => {
      this.postMessage(message);
    });

    messages.length = 0;
  }

  getClient(clientId) {
    return this.clients[clientId];
  }

  addClient(frame) {
    this.setClient(frame);
  }

  post(clientId, topic, data) {
    if (!this.getClient(clientId)) {
      throw new TypeError(`Given "${clientId}" client is not registered`);
    }

    const message = { clientId, topic, data };

    this.postMessage(message);

    return this;
  }

  postMessage(message) {
    const { clientId, topic, data } = message;
    const client = this.getClient(clientId);

    if (!utils.isClientConnected(client)) {
      this.addMessageToQueue(message);

      return;
    }

    this.postMessageToClient(clientId, topic, data);
  }

  on(clientId, topic, callback) {
    const { targetOrigin } = this.getClient(clientId);
    const listener = { targetOrigin, callback, clientId, topic };

    this.subjects[topic] = this.subjects[topic] || [];
    this.subjects[topic].push(listener);

    return this;
  }

  off(clientId, topic, callback) {
    let fn = this.offClient;

    if (callback) {
      fn = this.offClientTopicCallback;
    } else if (topic) {
      fn = this.offClientTopics;
    }

    fn.call(this, clientId, topic, callback);

    return this;
  }

  offClient(clientId) {
    Object.entries(this.subjects)
      .map(([topic, listeners]) => (
        [topic, listeners.filter(listener => listener.clientId !== clientId)]
      ))
      .forEach(([topic, listeners]) => {
        this.subjects[topic] = listeners;
      });
  }

  offClientTopics(clientId, topic) {
    let { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners) || !listeners.length) {
      return;
    }

    listeners = listeners.filter(listener => (
      listener.clientId !== clientId
    ));

    this.subjects[topic] = listeners;
  }

  offClientTopicCallback(clientId, topic, callback) {
    let { [topic]: listeners } = this.subjects;

    if (!Array.isArray(listeners) || !listeners.length) {
      return;
    }

    listeners = listeners.filter(listener => (
      listener.clientId !== clientId && listener.callback !== callback
    ));

    this.subjects[topic] = listeners;
  }

  stopHandshakePooling(clientId) {
    const interval = this.intervals[clientId];

    if (!clientId) {
      return;
    }

    clearTimeout(interval);
    delete this.intervals[clientId];
  }
}

export default Trainman;
