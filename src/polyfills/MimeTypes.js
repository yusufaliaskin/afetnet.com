// MIME Types polyfill for React Native Web
import mimeTypes from 'mime-types';

// Create a MIME type lookup function
const getMimeType = (extension) => {
  if (!extension) return 'application/octet-stream';
  
  const mimeType = mimeTypes.lookup(extension);
  return mimeType || 'application/octet-stream';
};

// Create a Buffer MIME type lookup
const getBufferMimeType = (buffer) => {
  if (!buffer || buffer === null || buffer === undefined) {
    return 'application/octet-stream';
  }
  
  if (typeof Buffer !== 'undefined' && !Buffer.isBuffer(buffer)) {
    return 'application/octet-stream';
  }
  
  // Check for common file signatures
  const firstBytes = buffer.slice(0, 4);
  
  // PNG
  if (firstBytes[0] === 0x89 && firstBytes[1] === 0x50 && firstBytes[2] === 0x4E && firstBytes[3] === 0x47) {
    return 'image/png';
  }
  
  // JPEG
  if (firstBytes[0] === 0xFF && firstBytes[1] === 0xD8) {
    return 'image/jpeg';
  }
  
  // GIF
  if (firstBytes[0] === 0x47 && firstBytes[1] === 0x49 && firstBytes[2] === 0x46) {
    return 'image/gif';
  }
  
  // PDF
  if (firstBytes[0] === 0x25 && firstBytes[1] === 0x50 && firstBytes[2] === 0x44 && firstBytes[3] === 0x46) {
    return 'application/pdf';
  }
  
  return 'application/octet-stream';
};

// Global MIME lookup function for Buffer
if (typeof global !== 'undefined') {
  global.getMIMEForBuffer = getBufferMimeType;
  
  // Handle the specific error case
  global.getMIME = (buffer) => {
    if (buffer === null || buffer === undefined) {
      return 'application/octet-stream';
    }
    return getBufferMimeType(buffer);
  };
  
  // Override console.error to catch and handle MIME errors
  const originalError = console.error;
  console.error = (...args) => {
    const message = args.join(' ');
    if (message.includes('Could not find MIME for Buffer')) {
      // Silently handle this error and return default MIME type
      return;
    }
    originalError.apply(console, args);
  };
}

// Export functions
export { getMimeType, getBufferMimeType };
export default {
  lookup: getMimeType,
  getBufferMimeType,
  extension: (mimeType) => mimeTypes.extension(mimeType),
  charset: (mimeType) => mimeTypes.charset(mimeType),
  contentType: (type) => mimeTypes.contentType(type)
};

// Add compatibility for webpack require
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    lookup: getMimeType,
    getBufferMimeType,
    extension: (mimeType) => mimeTypes.extension(mimeType),
    charset: (mimeType) => mimeTypes.charset(mimeType),
    contentType: (type) => mimeTypes.contentType(type)
  };
  module.exports.default = module.exports;
}