/* eslint-disable @typescript-eslint/no-require-imports */
const TerserPlugin = require('terser-webpack-plugin');

const { merge } = require('webpack-merge');
const baseConfig = require('./base.config.js');

module.exports = merge(baseConfig, {
  performance: {
    maxAssetSize: 1024 * 1024 * 5,      // 5 MB
    maxEntrypointSize: 1024 * 1024 * 5, // 5 MB
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [{ loader: 'ts-loader' }],
      },
    ],
  },

  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: true,
          ecma: 6,
          mangle: true,
        },
      }),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          enforce: true,
        },
      },
    },
  },
});
