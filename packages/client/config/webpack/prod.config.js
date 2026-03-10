const TerserPlugin = require("terser-webpack-plugin");

const { merge } = require("webpack-merge");
const baseConfig = require("./base.config.js");
const tagifyPathPattern = /node_modules[\\/]@yaireo[\\/]tagify[\\/]/;

module.exports = merge(baseConfig, {
  performance: {
    maxAssetSize: 1024 * 1024 * 5,
    maxEntrypointSize: 1024 * 1024 * 5,
  },
  module: {
    rules: [
      {
        test: /\.(t|j)s(x?)$/,
        exclude: (modulePath) =>
          /node_modules/.test(modulePath) &&
          !tagifyPathPattern.test(modulePath),
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                allowJs: true,
              },
              configFile: require("node:path").resolve(
                __dirname,
                "../../tsconfig.build.json",
              ),
            },
          },
        ],
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
          chunks: "initial",
          name: "vendor",
          enforce: true,
        },
      },
    },
  },
});
