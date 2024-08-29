import React from 'react';
import config, { Edition } from '@config/freeform/freeform.config';

import { DefaultList } from './default.list';
import { ProList } from './pro.list';

export const List: React.FC = () => {
  const isProEdition = config.editions.isAtLeast(Edition.Pro);

  if (isProEdition) {
    return <ProList />;
  }

  return <DefaultList />;
};
