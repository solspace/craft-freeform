import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';

import { FieldGroupWrapper, GroupTitle, List } from './field-group.styles';

import 'react-loading-skeleton/dist/skeleton.css';

type Props = {
  title: string;
  button?: {
    icon: ReactNode;
    title?: string;
    onClick?: () => void;
  };
};

export const FieldGroup: React.FC<PropsWithChildren<Props>> = ({
  title,
  button,
  children,
}) => {
  return (
    <FieldGroupWrapper>
      <GroupTitle>
        {title}
        {button && (
          <button type="button" title={button.title} onClick={button.onClick}>
            {button.icon}
          </button>
        )}
      </GroupTitle>
      <List>{children}</List>
    </FieldGroupWrapper>
  );
};
