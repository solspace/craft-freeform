import type { ReactNode } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';

import { FieldGroupWrapper, GroupTitle } from './field-group.styles';

type FieldGroupProps = {
  title: string;
  disabled?: boolean;
  editionIsPro?: boolean;
  button?: {
    icon: ReactNode;
    title?: string;
    onClick?: () => void;
  };
  children?: ReactNode;
};

export const FieldGroup: React.FC<FieldGroupProps> = ({
  title,
  disabled,
  editionIsPro,
  button,
  children,
}) => {
  return (
    <FieldGroupWrapper className={classes(disabled && 'disabled')}>
      <GroupTitle>
        {title}
        {button && (editionIsPro !== undefined ? editionIsPro : true) && (
          <button type="button" title={button.title} onClick={button.onClick}>
            {button.icon}
          </button>
        )}
      </GroupTitle>
      {children}
    </FieldGroupWrapper>
  );
};
