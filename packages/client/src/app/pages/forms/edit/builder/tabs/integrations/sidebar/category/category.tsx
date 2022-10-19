import { IntegrationCategory } from '@ff-client/types/integrations';
import React from 'react';

import { ChildrenWrapper, Label, Wrapper } from './category.styles';
import { Integration } from './integration/integration';

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
