import type { PropsWithChildren } from 'react';
import React from 'react';

import { FieldGroupWrapper, GroupTitle, List } from './field-group.styles';

import 'react-loading-skeleton/dist/skeleton.css';

type Props = {
  title: string;
};

export const FieldGroup: React.FC<PropsWithChildren<Props>> = ({
  title,
  children,
}) => {
  return (
    <FieldGroupWrapper>
      <GroupTitle>{title}</GroupTitle>
      <List>{children}</List>
    </FieldGroupWrapper>
  );
};
