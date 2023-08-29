import React from 'react';
import { Outlet, useResolvedPath } from 'react-router-dom';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import translate from '@ff-client/utils/translations';

import { MiniMap } from './sidebar/mini-map';
import { RulesWrapper } from './rules.styles';

export const Rules: React.FC = () => {
  const currentPath = useResolvedPath('');

  return (
    <RulesWrapper>
      <Breadcrumb label={translate('Rules')} url={currentPath.pathname} />
      <MiniMap />
      <Outlet />
    </RulesWrapper>
  );
};
