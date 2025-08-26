// UIManager polyfill for React Native Web

// Mock UIManager for web compatibility
const UIManager = {
  hasViewManagerConfig: (componentName) => {
    // Return false for all components on web
    return false;
  },
  
  getViewManagerConfig: (componentName) => {
    // Return null for all components on web
    return null;
  },
  
  setChildren: () => {
    // No-op for web
  },
  
  manageChildren: () => {
    // No-op for web
  },
  
  measure: () => {
    // No-op for web
  },
  
  measureInWindow: () => {
    // No-op for web
  },
  
  measureLayout: () => {
    // No-op for web
  },
  
  measureLayoutRelativeToParent: () => {
    // No-op for web
  },
  
  focus: () => {
    // No-op for web
  },
  
  blur: () => {
    // No-op for web
  },
  
  findSubviewIn: () => {
    // No-op for web
  },
  
  dispatchViewManagerCommand: () => {
    // No-op for web
  },
  
  showPopupMenu: () => {
    // No-op for web
  },
  
  dismissPopupMenu: () => {
    // No-op for web
  }
};

export default UIManager;
module.exports = UIManager;
module.exports.default = UIManager;

// Add ES6 export for compatibility
if (typeof exports === 'object' && typeof module !== 'undefined') {
  exports.default = UIManager;
}

// Ensure default export is available
Object.defineProperty(module.exports, 'default', {
  value: UIManager,
  enumerable: false,
  writable: false,
  configurable: false
});