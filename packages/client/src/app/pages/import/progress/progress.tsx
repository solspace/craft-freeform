import type { PropsWithChildren } from 'react';
import React from 'react';
import classes from '@ff-client/utils/classes';

import { ProgressBar, ProgressWrapper } from './progress.styles';

type Props = {
  show?: boolean;
  active?: boolean;
  value: number;
  max: number;
  width?: number | string;
};

export const Progress: React.FC<PropsWithChildren<Props>> = ({
  show,
  active,
  value,
  max,
  width,
  children,
}) => {
  if (!show) {
    return null;
  }

  return (
    <ProgressWrapper>
      <ProgressBar
        style={{ width }}
        $value={value}
        $max={max}
        className={classes(active && 'active')}
      >
        {children}
      </ProgressBar>
    </ProgressWrapper>
  );
};
