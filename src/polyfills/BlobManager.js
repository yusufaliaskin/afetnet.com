// Polyfill for React Native BlobManager in web environment
class BlobManager {
  static isAvailable = false;
  
  static createFromOptions(options) {
    // Return a simple blob-like object for web
    return new Blob([options], { type: 'application/octet-stream' });
  }
  
  static addWebSocketHandler(socketId) {
    // No-op for web
  }
  
  static removeWebSocketHandler(socketId) {
    // No-op for web
  }
  
  static sendOverSocket(blob, socketId) {
    // No-op for web
  }
}

// Export for both CommonJS and ES6 compatibility
export default BlobManager;
module.exports = BlobManager;
module.exports.default = BlobManager;