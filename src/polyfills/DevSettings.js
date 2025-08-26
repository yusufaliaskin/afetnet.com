// DevSettings polyfill for React Native Web
const DevSettings = {
  addMenuItem: () => {},
  reload: () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  },
  addDevMenuOption: () => {},
  onShakeOrPress: () => {},
};

export default DevSettings;