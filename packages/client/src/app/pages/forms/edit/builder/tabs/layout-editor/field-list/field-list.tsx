import React from 'react';

import { BaseFields } from './field-list/base-fields/base-fields';
import { Sidebar as SidebarWrapper } from '@ff-client/app/components/layout/sidebar/sidebar';
import { Search } from './search/search';

export const FieldList: React.FC = () => {
  return (
    <SidebarWrapper>
      <Search />
      <h2>Favorites</h2>
      <h2>New Fields</h2>
      <BaseFields />
      <h2>Something else?</h2>
    </SidebarWrapper>
  );
};
