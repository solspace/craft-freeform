import { existsSync, readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import ReactRefreshTypeScript from 'react-refresh-typescript';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import createStyledComponentsTransformer from 'typescript-plugin-styled-components';
import { merge } from 'webpack-merge';

import baseConfig from './base.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let serverOptions;
if (existsSync(resolve(__dirname, 'certs/key.pem'))) {
  serverOptions = {
    key: readFileSync(resolve(__dirname, 'certs/key.pem')),
    cert: readFileSync(resolve(__dirname, 'certs/cert.pem')),
  };
}

const clientDir = resolve(__dirname, '../../../plugin/src/Resources/js/client');

export default merge(baseConfig, {
  mode: 'development',

  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: 'https://127.0.0.1:8080/',
    path: clientDir,
  },

  devServer: {
    host: '127.0.0.1',
    allowedHosts: 'all',
    hot: true,
    server: {
      type: 'https',
      options: serverOptions,
    },
    client: {
      webSocketURL: 'https://127.0.0.1:8080/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
    static: {
      directory: clientDir,
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
                before: [
                  ReactRefreshTypeScript(),
                  createStyledComponentsTransformer.default(),
                ],
              }),
              configFile: resolve(__dirname, '../../tsconfig.build.json'),
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },

  devtool: 'eval-source-map',
});
