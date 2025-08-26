// PlatformColorValueTypes polyfill for React Native Web

const normalizeColorObject = (color) => {
  if (typeof color === 'string') {
    return color;
  }
  if (typeof color === 'object' && color !== null) {
    // Handle platform colors
    if (color.semantic) {
      return color.semantic;
    }
    if (color.dynamic) {
      return color.dynamic.light || color.dynamic.dark || '#000000';
    }
    if (color.resource_paths) {
      return '#000000'; // fallback
    }
  }
  return null;
};

const processColorObject = (color) => {
  return normalizeColorObject(color);
};

export { normalizeColorObject, processColorObject };
export default { normalizeColorObject, processColorObject };