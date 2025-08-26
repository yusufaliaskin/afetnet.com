// RCTAlertManager polyfill for React Native Web
const RCTAlertManager = {
  alertWithArgs: (args, callback) => {
    const { title, message, buttons } = args;
    
    if (typeof window !== 'undefined' && window.alert) {
      const alertMessage = message ? `${title}\n\n${message}` : title;
      
      if (buttons && buttons.length > 1) {
        // For multiple buttons, use confirm
        const result = window.confirm(alertMessage);
        if (callback) {
          callback(result ? 0 : 1);
        }
      } else {
        // For single button, use alert
        window.alert(alertMessage);
        if (callback) {
          callback(0);
        }
      }
    }
  },
};

export default RCTAlertManager;