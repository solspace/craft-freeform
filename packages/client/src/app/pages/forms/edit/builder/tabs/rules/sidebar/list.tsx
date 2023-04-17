import React from 'react';
import { Sidebar } from '@ff-client/app/components/layout/sidebar/sidebar';

import { Wrapper } from './list.styles';

export const List: React.FC = () => {
  return (
    <Sidebar lean>
      <Wrapper>Rules sidebar here</Wrapper>
    </Sidebar>
  );
};
