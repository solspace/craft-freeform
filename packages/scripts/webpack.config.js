const glob = require('glob');
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  mode: isProd ? 'production' : 'development',
  target: 'web',

  entry: () =>
    glob.sync('./src/components/**/*.{js,ts}').reduce((obj, el) => {
      obj[el] = el;
      return obj;
    }, {}),
  output: {
    filename: (pathData) => {
      const { name } = pathData.chunk;
      return name.replace('./src/components/', '').replace(/\.ts$/, '.js');
    },
    path: path.resolve(__dirname, '../plugin/src/Resources/js/scripts'),
  },

  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', { loader: 'css-loader' }],
      },
    ],
  },

  devtool: isProd ? false : 'eval-source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@lib': path.resolve(__dirname, 'src/lib/'),
      '@components': path.resolve(__dirname, 'src/components/'),
    },
  },
};
