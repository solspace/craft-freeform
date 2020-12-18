import PropTypes from 'prop-types';
import React from 'react';
import { translate, urlBuilder } from '../../../app';

const RequirePro = ({ link = 'plugin-store/freeform' }) => (
  <div
    dangerouslySetInnerHTML={{
      __html: translate('<a href="{url}">Upgrade to Pro</a> to get access to popular API integrations.', {
        url: urlBuilder(link),
      }),
    }}
  ></div>
);

RequirePro.propTypes = {
  link: PropTypes.string,
};

export default RequirePro;
