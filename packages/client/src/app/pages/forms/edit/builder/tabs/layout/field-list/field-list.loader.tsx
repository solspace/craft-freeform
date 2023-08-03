import React from 'react';
import { Sidebar } from '@components/layout/sidebar/sidebar';

import { LoaderFieldGroup } from './field-group/field-group.loader';
import { LoaderSearch } from './search/search.loader';

export const LoaderFieldList: React.FC = () => {
  return (
    <Sidebar>
      <LoaderSearch />
      <LoaderFieldGroup words={[50, 70]} items={16} />
    </Sidebar>
  );
};
