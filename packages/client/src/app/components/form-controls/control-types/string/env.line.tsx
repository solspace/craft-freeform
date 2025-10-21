import type { FC } from 'react';
import React from 'react';
import translate from '@ff-client/utils/translations';
import styled from 'styled-components';

export const EnvLine: FC = () => {
  return (
    <Paragraph className="notice has-icon">
      <span className="icon" aria-hidden="true" />
      <span className="visually-hidden">Tip: </span>
      <span>
        {translate('This can begin with an environment variable.')}{' '}
        <a
          href="https://craftcms.com/docs/5.x/configure.html#control-panel-settings"
          className="go"
          target="_blank"
          rel="noopener noreferrer"
        >
          {translate('Learn more')}
        </a>
      </span>
    </Paragraph>
  );
};

const Paragraph = styled.p`
  margin-top: 5px;
`;
