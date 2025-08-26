// GlobalPerformanceLogger polyfill for React Native Web

// Mock performance logger implementation
class GlobalPerformanceLogger {
  constructor() {
    this.timespans = new Map();
    this.extras = new Map();
    this.points = new Map();
  }

  addTimespan(key, lengthInMs, description) {
    this.timespans.set(key, { lengthInMs, description });
  }

  startTimespan(key, description) {
    this.points.set(key, { startTime: Date.now(), description });
  }

  stopTimespan(key) {
    const point = this.points.get(key);
    if (point) {
      const lengthInMs = Date.now() - point.startTime;
      this.addTimespan(key, lengthInMs, point.description);
      this.points.delete(key);
    }
  }

  clear() {
    this.timespans.clear();
    this.extras.clear();
    this.points.clear();
  }

  clearCompleted() {
    this.timespans.clear();
    this.extras.clear();
  }

  currentTimestamp() {
    return Date.now();
  }

  getTimespans() {
    return Object.fromEntries(this.timespans);
  }

  hasTimespan(key) {
    return this.timespans.has(key);
  }

  logTimespans() {
    if (__DEV__) {
      console.log('Performance timespans:', this.getTimespans());
    }
  }

  addExtra(key, value) {
    this.extras.set(key, value);
  }

  getExtras() {
    return Object.fromEntries(this.extras);
  }

  removeExtra(key) {
    this.extras.delete(key);
  }

  markPoint(key, timestamp) {
    this.points.set(key, { timestamp: timestamp || Date.now() });
  }

  getPoints() {
    return Object.fromEntries(this.points);
  }
}

// Create singleton instance
const globalPerformanceLogger = new GlobalPerformanceLogger();

// Export as default
export default globalPerformanceLogger;

// Also export the class for compatibility
export { GlobalPerformanceLogger, globalPerformanceLogger };

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = globalPerformanceLogger;
  module.exports.default = globalPerformanceLogger;
  module.exports.GlobalPerformanceLogger = GlobalPerformanceLogger;
  module.exports.globalPerformanceLogger = globalPerformanceLogger;
}