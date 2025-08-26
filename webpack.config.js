const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);
  
  // Add resolve aliases for React Native modules
  config.resolve.alias = {
    ...config.resolve.alias,
    // Platform polyfills
    'react-native/Libraries/Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    './Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    '../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    // DevSettings polyfill
    './DevSettings': path.resolve(__dirname, 'src/polyfills/DevSettings.js'),
    '../Utilities/DevSettings': path.resolve(__dirname, 'src/polyfills/DevSettings.js'),
    // HMRClient polyfill
    './HMRClient': path.resolve(__dirname, 'src/polyfills/HMRClient.js'),
    '../Utilities/HMRClient': path.resolve(__dirname, 'src/polyfills/HMRClient.js'),
    // WebSocket polyfills
    './NativeWebSocketModule': path.resolve(__dirname, 'src/polyfills/WebSocket.js'),
    '../Utilities/binaryToBase64': path.resolve(__dirname, 'src/polyfills/WebSocket.js'),
    './WebSocketEvent': path.resolve(__dirname, 'src/polyfills/WebSocket.js'),
    // PlatformColorValueTypes polyfill
    './PlatformColorValueTypes': path.resolve(__dirname, 'src/polyfills/PlatformColorValueTypes.js'),
    // AccessibilityInfo polyfill
    '../Components/AccessibilityInfo/legacySendAccessibilityEvent': path.resolve(__dirname, 'src/polyfills/AccessibilityInfo.js'),
    // BaseViewConfig polyfill
    './BaseViewConfig': path.resolve(__dirname, 'src/polyfills/BaseViewConfig.js'),
    // RCTNetworking polyfill
    './RCTNetworking': path.resolve(__dirname, 'src/polyfills/RCTNetworking.js'),
    // BackHandler polyfill
    '../Utilities/BackHandler': path.resolve(__dirname, 'src/polyfills/BackHandler.js'),
    // Platform polyfill for LogBox
    '../../Utilities/Platform': path.resolve(__dirname, 'src/polyfills/Platform.js'),
    // Image polyfill
    '../../Image/Image': 'react-native-web/dist/exports/Image',
    // RCTAlertManager polyfill
    './RCTAlertManager': path.resolve(__dirname, 'src/polyfills/RCTAlertManager.js'),
    // PlatformColorValueTypes polyfill (different path)
    '../../StyleSheet/PlatformColorValueTypes': path.resolve(__dirname, 'src/polyfills/PlatformColorValueTypes.js'),
    // DevToolsSettingsManager polyfill
    '../DevToolsSettings/DevToolsSettingsManager': path.resolve(__dirname, 'src/polyfills/DevToolsSettingsManager.js'),
    // BlobManager polyfill
    '../Blob/BlobManager': path.resolve(__dirname, 'src/polyfills/BlobManager.js'),
    'react-native/Libraries/Blob/BlobManager': path.resolve(__dirname, 'src/polyfills/BlobManager.js'),
    // NativeBlobModule polyfill
    './NativeBlobModule': path.resolve(__dirname, 'src/polyfills/NativeBlobModule.js'),
    '../Blob/NativeBlobModule': path.resolve(__dirname, 'src/polyfills/NativeBlobModule.js'),
    // MIME type polyfill
    'mime-types': path.resolve(__dirname, 'src/polyfills/MimeTypes.js'),
    // Buffer polyfill
    'buffer': path.resolve(__dirname, 'src/polyfills/BufferPolyfill.js'),
    // UIManager polyfill
    '../ReactNative/UIManager': path.resolve(__dirname, 'src/polyfills/UIManager.js'),
    './UIManager': path.resolve(__dirname, 'src/polyfills/UIManager.js'),
    // createReactNativeComponentClass polyfill
    '../Renderer/shims/createReactNativeComponentClass': path.resolve(__dirname, 'src/polyfills/createReactNativeComponentClass.js'),
    './createReactNativeComponentClass': path.resolve(__dirname, 'src/polyfills/createReactNativeComponentClass.js'),
    'react-native/Libraries/Renderer/shims/createReactNativeComponentClass': path.resolve(__dirname, 'src/polyfills/createReactNativeComponentClass.js'),
    // GlobalPerformanceLogger polyfill
    './GlobalPerformanceLogger': path.resolve(__dirname, 'src/polyfills/GlobalPerformanceLogger.js'),
    '../Utilities/GlobalPerformanceLogger': path.resolve(__dirname, 'src/polyfills/GlobalPerformanceLogger.js'),
    // convertRequestBody polyfill
    './convertRequestBody': path.resolve(__dirname, 'src/polyfills/convertRequestBody.js'),
    '../Network/convertRequestBody': path.resolve(__dirname, 'src/polyfills/convertRequestBody.js'),
  };
  
  // Add fallbacks for Node.js modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    "buffer": require.resolve("buffer"),
    "stream": require.resolve("stream-browserify"),
    "util": require.resolve("util"),
    "crypto": require.resolve("crypto-browserify"),
    "vm": require.resolve("vm-browserify"),
    "process": require.resolve("process/browser"),
  };
  
  // Add alias for BlobManager and other React Native modules
  config.resolve.alias = {
    ...config.resolve.alias,
    '../Blob/BlobManager': path.resolve(__dirname, 'src/polyfills/BlobManager.js'),
    'react-native/Libraries/Blob/BlobManager': path.resolve(__dirname, 'src/polyfills/BlobManager.js'),
    'react-native/Libraries/Blob/BlobManager.js': path.resolve(__dirname, 'src/polyfills/BlobManager.js'),
  };
  
  // Add extensions for better module resolution
  config.resolve.extensions = [
    ...config.resolve.extensions,
    '.web.js',
    '.web.ts',
    '.web.tsx'
  ];
  
  // Add plugins for global variables
  const webpack = require('webpack');
  
  // Add NormalModuleReplacementPlugin for more reliable module replacement
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /react-native\/Libraries\/Blob\/BlobManager/,
      path.resolve(__dirname, 'src/polyfills/BlobManager.js')
    )
  );
  
  // Add MIME type replacement
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /mime-types/,
      path.resolve(__dirname, 'src/polyfills/MimeTypes.js')
    )
  );
  
  // Add createReactNativeComponentClass replacement
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /createReactNativeComponentClass/,
      path.resolve(__dirname, 'src/polyfills/createReactNativeComponentClass.js')
    )
  );
  
  // Add GlobalPerformanceLogger replacement
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /GlobalPerformanceLogger/,
      path.resolve(__dirname, 'src/polyfills/GlobalPerformanceLogger.js')
    )
  );
  
  config.plugins.push(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    })
  );
  
  // Add DefinePlugin to handle Buffer properly
  config.plugins.push(
    new webpack.DefinePlugin({
      'global.Buffer': 'Buffer',
      'global.process': 'process',
      'global.getMIMEForBuffer': '(() => "application/octet-stream")',
      '__DEV__': JSON.stringify(process.env.NODE_ENV !== 'production'),
      'Buffer.getMIME': '(() => "application/octet-stream")',
      'getMIME': '(() => "application/octet-stream")',
    })
  );
  
  // Add MIME type resolver plugin
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /Could not find MIME for Buffer/,
      () => 'application/octet-stream'
    )
  );
  
  // Fix Buffer MIME type issue with comprehensive approach
  config.module.rules.push({
    test: /node_modules[\\\/]buffer[\\\/]/,
    type: 'javascript/auto',
    resolve: {
      fullySpecified: false
    }
  });
  
  // Add specific handling for buffer module
  config.module.rules.push({
    test: /\.js$/,
    include: /node_modules.*buffer/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-env'],
        plugins: []
      },
    },
  });
  
  // Add IgnorePlugin to ignore problematic modules
  config.plugins.push(
    new webpack.IgnorePlugin({
      resourceRegExp: /^buffer$/,
      contextRegExp: /mime/
    })
  );
  
  // Add custom resolver for MIME type errors
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(
      /Could not find MIME for Buffer/,
      path.resolve(__dirname, 'src/polyfills/MimeTypes.js')
    )
  );
  
  // Override module resolution for buffer-related MIME issues
  const originalResolve = config.resolve.plugins || [];
  config.resolve.plugins = [
    ...originalResolve,
    {
      apply(resolver) {
        resolver.hooks.resolve.tapAsync('BufferMimeResolver', (request, resolveContext, callback) => {
          if (request.request && request.request.includes('Could not find MIME for Buffer')) {
            return callback(null, {
              ...request,
              request: path.resolve(__dirname, 'src/polyfills/MimeTypes.js')
            });
          }
          callback();
        });
      }
    }
  ];
  
  return config;
};