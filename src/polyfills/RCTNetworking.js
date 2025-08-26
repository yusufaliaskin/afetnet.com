// RCTNetworking polyfill for React Native Web
const RCTNetworking = {
  sendRequest: () => {},
  abortRequest: () => {},
  clearCookies: () => {},
  addListener: () => ({ remove: () => {} }),
  removeListeners: () => {},
};

export default RCTNetworking;