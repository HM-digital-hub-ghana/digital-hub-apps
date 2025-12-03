const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add path aliases for Metro resolver
config.resolver.alias = {
  '@': __dirname,
  '@web': __dirname + '/src/web',
  '@native': __dirname + '/src/native',
  '@shared': __dirname + '/src/shared',
  // Force react-day-picker to use CommonJS build for Metro compatibility
  'react-day-picker': path.resolve(__dirname, 'node_modules/react-day-picker/dist/cjs/index.js'),
  //react-router-dom and react-router/dom are handled by custom resolver to support platform-specific mocks (native) vs real implementation (web)
};

// Configure Metro to handle ESM packages (like Radix UI and react-day-picker)
// Add mjs, cjs, and js to source extensions for ESM packages
config.resolver.sourceExts.push('mjs', 'cjs');
// Ensure mjs is not treated as an asset
if (config.resolver.assetExts.includes('mjs')) {
  config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'mjs');
}

// Prefer CommonJS builds (main field) over ESM (module field) for better Metro compatibility
// This ensures Metro uses CommonJS builds which don't have import.meta issues
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configure Metro to transpile React Router which uses import.meta.hot
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// configure Metro to apply Babel transformations to react-router-dom - to transform import.meta
config.serializer = {
  ...config.serializer,
};

//disable package exports and use aliases to avoid import.meta issues
// The alias above maps react-router/dom to the actual file
config.resolver.unstable_enablePackageExports = false;

// Custom resolver to handle react-router subpath exports and mock reanimated on web
// Also mocks react-router-dom on native to prevent bundling errors
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Mock react-native-reanimated on web to prevent worklets error
  if (moduleName === 'react-native-reanimated' && platform === 'web') {
    const mockPath = path.resolve(__dirname, 'src/web/mocks/react-native-reanimated.js');
    return {
      type: 'sourceFile',
      filePath: mockPath,
    };
  }
  
  // Mock react-router-dom on native (not web) to prevent bundling errors
  // Web builds should use the real react-router-dom
  if (moduleName === 'react-router-dom' && platform !== 'web') {
    const mockPath = path.resolve(__dirname, 'src/native/mocks/react-router-dom.js');
    return {
      type: 'sourceFile',
      filePath: mockPath,
    };
  }
  
  // Mock react-router on native (not web) to prevent bundling errors
  if (moduleName === 'react-router' && platform !== 'web') {
    const mockPath = path.resolve(__dirname, 'src/native/mocks/react-router.js');
    return {
      type: 'sourceFile',
      filePath: mockPath,
    };
  }
  
  // Handle react-router/dom subpath export for web only
  if (moduleName === 'react-router/dom') {
    // On native, mock it; on web, use the real implementation
    if (platform !== 'web') {
      const mockPath = path.resolve(__dirname, 'src/native/mocks/react-router-dom.js');
      return {
        type: 'sourceFile',
        filePath: mockPath,
      };
    }
    const domExportPath = path.resolve(__dirname, 'node_modules/react-router/dist/development/dom-export.js');
    return {
      type: 'sourceFile',
      filePath: domExportPath,
    };
  }
  
  // Use default resolver for everything else
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  
  // Fallback to default resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
