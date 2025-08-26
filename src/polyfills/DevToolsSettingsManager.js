// DevToolsSettingsManager polyfill for React Native Web
const DevToolsSettingsManager = {
  getSettings: () => ({}),
  setSettings: () => {},
  reload: () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
  setProfilingSettings: () => {},
  getProfilingSettings: () => ({}),
};

module.exports = DevToolsSettingsManager;