import React from 'react';
import { Sidebar as SidebarWrapper } from '@ff-client/app/components/layout/sidebar/sidebar';

import { FieldGroup } from './field-group/field-group';
import { Search } from './search/search';

export const FieldList: React.FC = () => {
  return (
    <SidebarWrapper>
      <Search />
      <FieldGroup title="Base Fields" />
    </SidebarWrapper>
  );
};
