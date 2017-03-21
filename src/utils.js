import * as CONSTANTS from './constants';

export const isElAnIframe = el => el instanceof CONSTANTS.IFRAME_INTERFACE;

export const isClientConnected = client => Boolean(client.connected);

export const getOrigin = () => window.location.origin;

export const isHandshake = topic => topic === CONSTANTS.HANDSHAKE_TOPIC;

export const isMatchingOrigin = (sourceOrigin) => {
  const hostOrigin = getOrigin();
  const isMatching = sourceOrigin === hostOrigin;

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
