// AccessibilityInfo polyfill for React Native Web

const legacySendAccessibilityEvent = () => {
  // No-op for web
};

const AccessibilityInfo = {
  isReduceMotionEnabled: () => Promise.resolve(false),
  isBoldTextEnabled: () => Promise.resolve(false),
  isGrayscaleEnabled: () => Promise.resolve(false),
  isInvertColorsEnabled: () => Promise.resolve(false),
  isReduceTransparencyEnabled: () => Promise.resolve(false),
  isScreenReaderEnabled: () => Promise.resolve(false),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
  setAccessibilityFocus: () => {},
  announceForAccessibility: () => {},
  sendAccessibilityEvent: () => {},
};

export { legacySendAccessibilityEvent };
export default AccessibilityInfo;