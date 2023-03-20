import React from 'react';
import type { NotificationCategory } from '@ff-client/types/notifications';

import { Notification } from './notification/notification';
import { ChildrenWrapper, Label, Wrapper } from './category.styles';

export const Category: React.FC<NotificationCategory> = ({
  label,
  children,
}) => {
  return (
    <Wrapper>
      <Label>{label}</Label>
      <ChildrenWrapper>
        {children.map((child) => (
          <Notification key={child.id} {...child} />
        ))}
      </ChildrenWrapper>
    </Wrapper>
  );
};
