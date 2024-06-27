const webpack = require('webpack');

module.exports = function override(config, env) {
  config.resolve.fallback = {
    process: require.resolve('process/browser'),
  };

  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ]);

  return config;
};
