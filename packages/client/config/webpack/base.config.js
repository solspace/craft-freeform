const path = require('path');

module.exports = {
  mode: 'production',
  target: ['web', 'es5'],

  entry: {
    client: path.resolve(__dirname, '../../src/index.tsx'),
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, '../../../plugin/src/Resources/js/client'),
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader' }],
      },
      {
        test: /\.svg$/,
        loader: '@svgr/webpack',
      },
      {
        test: /\.(png|jpg|jpeg|gif)$/i,
        use: [{ loader: 'url-loader' }],
      },
    ],
  },

  devtool: false,

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@ff-client': path.resolve(__dirname, '../../src/'),
    },
  },
};
