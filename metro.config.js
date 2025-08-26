const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration for React Native Web
config.resolver.alias = {
  ...config.resolver.alias,
  // Platform polyfills
  'react-native/Libraries/Utilities/Platform': require.resolve('./src/polyfills/Platform.js'),
  './Platform': require.resolve('./src/polyfills/Platform.js'),
  '../Utilities/Platform': require.resolve('./src/polyfills/Platform.js'),
  // WebSocket polyfills
  './NativeWebSocketModule': require.resolve('./src/polyfills/WebSocket.js'),
  '../Utilities/binaryToBase64': require.resolve('./src/polyfills/WebSocket.js'),
  // convertRequestBody polyfill
  './convertRequestBody': require.resolve('./src/polyfills/convertRequestBody.js'),
  '../Network/convertRequestBody': require.resolve('./src/polyfills/convertRequestBody.js'),
};

// Add platform extensions
config.resolver.platforms = ['web', 'native', 'ios', 'android'];

// Add source extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

module.exports = config;