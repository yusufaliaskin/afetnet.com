// WebSocket polyfills for React Native Web

// NativeWebSocketModule polyfill
export const NativeWebSocketModule = {
  connect: () => {},
  send: () => {},
  sendBinary: () => {},
  ping: () => {},
  close: () => {},
  addListener: () => {},
  removeListeners: () => {},
};

// WebSocketEvent polyfill
export const WebSocketEvent = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
};

// binaryToBase64 polyfill
export const binaryToBase64 = (data) => {
  if (typeof btoa !== 'undefined') {
    return btoa(data);
  }
  return '';
};

export default {
  NativeWebSocketModule,
  WebSocketEvent,
  binaryToBase64,
};