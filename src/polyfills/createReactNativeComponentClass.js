// createReactNativeComponentClass polyfill for React Native Web
import React from 'react';

// Mock createReactNativeComponentClass function
const createReactNativeComponentClass = (name, createViewConfig) => {
  // Return a simple React component that renders a div
  return React.forwardRef((props, ref) => {
    const { style, children, ...otherProps } = props;
    
    // Convert React Native styles to web-compatible styles
    const webStyle = {
      ...style,
      display: style?.display || 'flex',
      flexDirection: style?.flexDirection || 'column',
    };
    
    return React.createElement('div', {
      ref,
      style: webStyle,
      ...otherProps
    }, children);
  });
};

// Export as default
export default createReactNativeComponentClass;

// Also export as named export for compatibility
export { createReactNativeComponentClass };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = createReactNativeComponentClass;
  module.exports.default = createReactNativeComponentClass;
  module.exports.createReactNativeComponentClass = createReactNativeComponentClass;
}