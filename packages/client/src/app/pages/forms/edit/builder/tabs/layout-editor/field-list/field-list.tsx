import React, { useState } from 'react';

import { BaseFields } from './field-list/base-fields/base-fields';
import { Sidebar as SidebarWrapper } from '@ff-client/app/components/layout/sidebar/sidebar';
import { Search } from './search/search';

export const FieldList: React.FC = () => {
  return (
    <SidebarWrapper>
      <Search />
      <BaseFields />
    </SidebarWrapper>
  );
};
