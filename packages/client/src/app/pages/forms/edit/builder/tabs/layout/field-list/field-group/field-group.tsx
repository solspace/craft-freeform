import type { PropsWithChildren, ReactNode } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';

import { FieldGroupWrapper, GroupTitle } from './field-group.styles';

import 'react-loading-skeleton/dist/skeleton.css';

type Props = {
  title: string;
  disabled?: boolean;
  button?: {
    icon: ReactNode;
    title?: string;
    onClick?: () => void;
  };
};

export const FieldGroup: React.FC<PropsWithChildren<Props>> = ({
  title,
  disabled,
  button,
  children,
}) => {
  return (
    <FieldGroupWrapper className={classes(disabled && 'disabled')}>
      <GroupTitle>
        {title}
        {button && (
          <button type="button" title={button.title} onClick={button.onClick}>
            {button.icon}
          </button>
        )}
      </GroupTitle>
      {children}
    </FieldGroupWrapper>
  );
};
