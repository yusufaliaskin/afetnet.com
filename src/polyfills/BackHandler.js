// BackHandler polyfill for React Native Web
const BackHandler = {
  exitApp: () => {
    if (typeof window !== 'undefined' && window.history) {
      window.history.back();
    }
  },
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

export default BackHandler;