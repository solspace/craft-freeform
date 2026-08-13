const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  target: ['web', 'es5'],

  entry: {
    'welcome-screen': path.resolve(__dirname, 'src/welcome-screen/index.tsx'),
    'form-modal': path.resolve(__dirname, 'src/form-modal/index.tsx'),
  },
  output: {
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/',
    path: path.resolve(__dirname, '../plugin/src/Resources/js/app'),
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

  devtool: process.env.NODE_ENV === 'production' ? false : 'eval-cheap-source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@ff-app': path.resolve(__dirname, 'src/'),
      '@ff-welcome-screen': path.resolve(__dirname, 'src/welcome-screen/'),
      '@ff-form-modal': path.resolve(__dirname, 'src/form-modal/'),
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
