const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'astronomy-bundle') {
    // Force metro to resolve to the correct file.
    return {
      filePath: path.resolve(__dirname, 'node_modules/astronomy-bundle/dist/index.js'),
      type: 'sourceFile',
    };
  }
  // Let the default resolver handle everything else.
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config; 