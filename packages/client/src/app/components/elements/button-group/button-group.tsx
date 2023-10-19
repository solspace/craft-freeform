import type { ReactNode } from 'react';
import React from 'react';
import type { OptionCollection } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import { Button, ButtonGroupWrapper } from './button-group.styles';

type Props = {
  value: string;
  options: OptionCollection;
  onClick: (value: string) => void;
};

export const ButtonGroup: React.FC<Props> = ({ value, options, onClick }) => {
  const elements: ReactNode[] = [];

  options.forEach((option, idx) => {
    if ('value' in option) {
      elements.push(
        <Button
          key={idx}
          className={classes(option.value === value && 'active')}
          onClick={() => onClick(option.value)}
        >
          {option.label}
        </Button>
      );
    }
  });

  return <ButtonGroupWrapper>{elements}</ButtonGroupWrapper>;
};
