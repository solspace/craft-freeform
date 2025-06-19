import type { ReactNode } from 'react';
import React from 'react';
import type { Edition } from '@config/freeform/freeform.config';
import config from '@config/freeform/freeform.config';
import classes from '@ff-client/utils/classes';

import { FieldGroupWrapper, GroupTitle } from './field-group.styles';

type FieldGroupProps = {
  title: string;
  disabled?: boolean;
  minEdition?: Edition;
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
  button,
  minEdition,
  children,
}) => {
  const { editions } = config;
  const matchesMinEdition =
    minEdition !== undefined ? editions.isAtLeast(minEdition) : true;

  return (
    <FieldGroupWrapper className={classes(disabled && 'disabled')}>
      <GroupTitle>
        {title}
        {button && matchesMinEdition && (
          <button type="button" title={button.title} onClick={button.onClick}>
            {button.icon}
          </button>
        )}
      </GroupTitle>
      {children}
    </FieldGroupWrapper>
  );
};
