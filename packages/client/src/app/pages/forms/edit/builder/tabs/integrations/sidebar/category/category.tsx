import React from 'react';
import type { IntegrationCategory } from '@ff-client/types/integrations';

import { Integration } from './integration/integration';
import { ChildrenWrapper, Label, Wrapper } from './category.styles';

export const Category: React.FC<IntegrationCategory> = ({
  label,
  children,
}) => {
  return (
    <Wrapper>
      <Label>{label}</Label>
      <ChildrenWrapper>
        {children.map((child) => (
          <Integration key={child.id} {...child} />
        ))}
      </ChildrenWrapper>
    </Wrapper>
  );
};
