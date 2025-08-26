// Platform polyfill for React Native Web
const Platform = {
  OS: 'web',
  select: (obj) => {
    return obj.web || obj.default;
  },
  isTV: false,
  isTesting: false,
  Version: undefined,
  constants: {},
};

export default Platform;