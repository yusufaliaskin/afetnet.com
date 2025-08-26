// NativeBlobModule polyfill for React Native Web

const NativeBlobModule = {
  addWebSocketHandler: (socketId) => {
    console.log('NativeBlobModule: addWebSocketHandler called for', socketId);
  },
  
  removeWebSocketHandler: (socketId) => {
    console.log('NativeBlobModule: removeWebSocketHandler called for', socketId);
  },
  
  sendOverSocket: (data, socketId) => {
    console.log('NativeBlobModule: sendOverSocket called for', socketId);
  },
  
  createFromParts: (parts, options) => {
    console.log('NativeBlobModule: createFromParts called');
    return { blobId: 'web-blob-' + Math.random().toString(36).substr(2, 9) };
  },
  
  release: (blobId) => {
    console.log('NativeBlobModule: release called for', blobId);
  }
};

module.exports = NativeBlobModule;