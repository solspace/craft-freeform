const path = require('path');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const ReactRefreshTypeScript = require('react-refresh-typescript');

const { merge } = require('webpack-merge');
const baseConfig = require('./base.config.js');

module.exports = merge(baseConfig, {
  mode: 'development',

  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: 'https://127.0.0.1:8080/',
    path: path.resolve(__dirname, '../../../plugin/src/Resources/js/client'),
  },

  devServer: {
    host: '127.0.0.1',
    allowedHosts: ['craft.test'],
    hot: true,
    server: 'https',
    client: {
      webSocketURL: 'https://127.0.0.1:8080/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
    },
    static: {
      directory: path.resolve(__dirname, '../../../plugin/src/Resources/js/client'),
    },
  },

  plugins: [new ReactRefreshWebpackPlugin()],

  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              getCustomTransformers: () => ({
                before: [ReactRefreshTypeScript()],
              }),
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },

  devtool: 'eval-source-map',
});
