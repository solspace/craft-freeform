const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  target: 'web',

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
      {
        test: /\.(png|jpg|jpeg|svg|gif)$/i,
        use: [{ loader: 'url-loader' }],
      },
      // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'source-map-loader',
      },
    ],
  },

  devtool: isProd ? false : 'eval-source-map',

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
