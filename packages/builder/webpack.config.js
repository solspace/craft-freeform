const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: ['web', 'es5'],

  entry: {
    builder: path.resolve(__dirname, 'src/app.jsx'),
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, '../plugin/src/Resources/js/builder'),
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader' }],
      },
    ],
  },

  devtool: process.env.NODE_ENV === 'production' ? false : 'eval-source-map',

  resolve: {
    extensions: ['.js', '.jsx', '.styl'],
    alias: {
      '@ff/builder': path.resolve(__dirname, 'src/'),
    },
  },

  optimization: {
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          compress: true,
          ecma: 5,
          mangle: true,
        },
      }),
    ],
    splitChunks: {
      chunks: 'initial',
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          name: 'vendor',
          enforce: true,
        },
      },
    },
    runtimeChunk: false,
  },
};
