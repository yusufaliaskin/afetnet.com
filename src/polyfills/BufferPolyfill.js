// Buffer polyfill for React Native Web
import { Buffer } from 'buffer';

// Create a Buffer polyfill with MIME type support
class BufferPolyfill extends Buffer {
  static getMimeType(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer)) {
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
  }
  
  static isBuffer(obj) {
    return Buffer.isBuffer(obj);
  }
  
  static from(data, encoding) {
    return Buffer.from(data, encoding);
  }
  
  static alloc(size, fill, encoding) {
    return Buffer.alloc(size, fill, encoding);
  }
  
  static allocUnsafe(size) {
    return Buffer.allocUnsafe(size);
  }
  
  static concat(list, totalLength) {
    return Buffer.concat(list, totalLength);
  }
}

// Override global Buffer if needed
if (typeof global !== 'undefined' && !global.Buffer) {
  global.Buffer = BufferPolyfill;
}

export default BufferPolyfill;
export { BufferPolyfill as Buffer };