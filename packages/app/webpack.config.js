const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  target: 'web',

  entry: {
    'welcome-screen': path.resolve(__dirname, 'src/welcome-screen/index.tsx'),
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

  devtool: isProd ? false : 'eval-cheap-source-map',

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      '@ff-app': path.resolve(__dirname, 'src/'),
      '@ff-welcome-screen': path.resolve(__dirname, 'src/welcome-screen/'),
    },
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
};
