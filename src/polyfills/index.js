// React Native Web Polyfills
import 'react-native-url-polyfill/auto';
import Platform from './Platform';
import { NativeWebSocketModule, WebSocketEvent, binaryToBase64 } from './WebSocket';

// URL polyfill for React Native
if (typeof URL === 'undefined' || !URL.prototype) {
  global.URL = require('react-native-url-polyfill').URL;
}

// URLSearchParams polyfill
if (typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = require('react-native-url-polyfill').URLSearchParams;
}

// Global polyfills
if (typeof global === 'undefined') {
  global = window;
}

// Buffer polyfill for web
if (typeof Buffer === 'undefined') {
  global.Buffer = {
    from: (data) => new Uint8Array(data),
    isBuffer: () => false,
  };
}

// Process polyfill
if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: 'development',
    },
    nextTick: (callback) => setTimeout(callback, 0),
  };
}

// DevSettings polyfill
const DevSettings = {
  addMenuItem: () => {},
  reload: () => window.location.reload(),
};

// HMRClient polyfill
const HMRClient = {
  setup: () => {},
  enable: () => {},
  disable: () => {},
};

// Export polyfills
export {
  Platform,
  NativeWebSocketModule,
  WebSocketEvent,
  binaryToBase64,
  DevSettings,
  HMRClient,
};

// Make them globally available
global.Platform = Platform;
global.DevSettings = DevSettings;
global.HMRClient = HMRClient;

export default {
  Platform,
  NativeWebSocketModule,
  WebSocketEvent,
  binaryToBase64,
  DevSettings,
  HMRClient,
};