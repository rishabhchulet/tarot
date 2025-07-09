module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for react-native-reanimated to work properly
      // NOTE: 'react-native-reanimated/plugin' has to be listed last.
      'react-native-reanimated/plugin',
    ],
  };
};