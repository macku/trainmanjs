import * as CONSTANTS from './constants';

const HOST_REGEXP = /https?:\/\/[a-z0-9\-.:]+\/?/i;

export const isElAnIframe = el => el instanceof CONSTANTS.IFRAME_INTERFACE;

export const isClientConnected = client => Boolean(client.connected);

export const getOrigin = () => window.location.origin;

export const isHandshake = topic => topic === CONSTANTS.HANDSHAKE_TOPIC;

export const getOriginFromUri = uri => (
  uri.match(HOST_REGEXP)
    .pop()
    .replace(/\/$/, '')
);

export const isMatchingOrigin = (targetOrigin, sourceOrigin) => {
  const isMatching = targetOrigin === sourceOrigin;

  return isMatching;
};

export const retrieveMessageFromEvent = (event) => {
  const { source, origin: sourceOrigin } = event;
  const {
    [CONSTANTS.TOPIC_KEY]: topic,
    [CONSTANTS.DATA_KEY]: data
  } = event.data;

  return { topic, data, source, sourceOrigin };
};

export const buildMessage = (topic, data = null) => {
  const message = {
    [CONSTANTS.TOPIC_KEY]: topic
  };

  if (data !== null) {
    message[CONSTANTS.DATA_KEY] = data;
  }

  return message;
};

export const createEmptyHost = () => ({
  origin: null,
  source: null,
  connected: false
});

export const createHostFromMessage = (message) => {
  const { source, sourceOrigin: origin } = message;

  return { origin, source, connected: true };
};
