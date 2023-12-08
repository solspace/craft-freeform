const path = require('path');

module.exports = ({ config }) => {
  config.resolve.alias = {
    ...config.resolve.alias,
    '@config': path.resolve(__dirname, '../config/'),
    '@editor': path.resolve(__dirname, '../src/app/pages/forms/edit/'),
    '@components': path.resolve(__dirname, '../src/app/components/'),
    '@ff-icons': path.resolve(__dirname, '../src/assets/icons/'),
    '@ff-client': path.resolve(__dirname, '../src/'),
  };

  config.module.rules = config.module.rules.map((rule) => {
    if (
      String(rule.test) ===
      String(
        /\.(svg|ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/
      )
    ) {
      return {
        ...rule,
        test: /\.(ico|jpg|jpeg|png|apng|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
      };
    }

    return rule;
  });

  config.module.rules.push({
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  });

  return config;
};
