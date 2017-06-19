const noop = () => null;

export const DEFAULT_TRAINMAN_CONFIG = {
  handshakeInterval: 0.5 * 1000,
  debug: false,
  debugCallback: noop
};

export const DEFAULT_PASSENGER_CONFIG = {
  debug: false,
  debugCallback: noop
};

export const TOPIC_KEY = 'topic';
export const DATA_KEY = 'data';
export const FINGERPRINT_KEY = 'data';
export const MESSAGE_EVENT_NAME = 'message';
export const UNLOAD_EVENT_NAME = 'unload';

export const HANDSHAKE_TOPIC = 'HANDSHAKE';
export const BACK_HANDSHAKE_TOPIC = 'BACK_HANDSHAKE';
export const CLIENT_DISCONNECTED_TOPIC = 'CLIENT_DISCONNECTED';

export const IFRAME_INTERFACE = window.HTMLIFrameElement;

export const FINGERPRINT = '7r41nm4nj5';
