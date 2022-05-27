import React from 'react';
import { BaseFields } from './base-fields/base-fields';

import { Container, Wrapper } from './sidebar.styles';

export const Sidebar: React.FC = () => {
  return (
    <Wrapper>
      <Container>
        <BaseFields />
      </Container>
    </Wrapper>
  );
};
