import type { PropsWithChildren } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';

import { ProgressBarElement, ProgressContainer } from './progress.styles';

const color = {
  primary: '#e12d39',
  secondary: '#B0BEC5',
};

type Props = {
  show?: boolean;
  active?: boolean;
  variant?: 'primary' | 'secondary';
  value: number;
  max: number;
  width?: number | string;
};

export const ProgressBar: React.FC<PropsWithChildren<Props>> = ({
  show,
  active,
  variant = 'primary',
  value,
  max,
  width,
  children,
}) => {
  if (!show) {
    return null;
  }

  return (
    <ProgressContainer className={classes(variant)}>
      {children && <label>{children}</label>}
      <ProgressBarElement
        style={{ width }}
        $color={color[variant]}
        $value={value}
        $max={max}
        className={classes(active && 'active')}
      />
    </ProgressContainer>
  );
};
