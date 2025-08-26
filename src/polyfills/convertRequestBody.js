// convertRequestBody polyfill for React Native Android

// Convert request body to appropriate format for network requests
const convertRequestBody = (body) => {
  if (!body) {
    return null;
  }
  
  // If it's already a string, return as is
  if (typeof body === 'string') {
    return body;
  }
  
  // If it's FormData, return as is (browser will handle)
  if (typeof FormData !== 'undefined' && body instanceof FormData) {
    return body;
  }
  
  // If it's an object, stringify it
  if (typeof body === 'object') {
    try {
      return JSON.stringify(body);
    } catch (error) {
      console.warn('Failed to stringify request body:', error);
      return String(body);
    }
  }
  
  // For other types, convert to string
  return String(body);
};

// Export as default
export default convertRequestBody;

// Also export as named export for compatibility
export { convertRequestBody };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = convertRequestBody;
  module.exports.default = convertRequestBody;
  module.exports.convertRequestBody = convertRequestBody;
}