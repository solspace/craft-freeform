import React from 'react';
import classes from '@ff-client/utils/classes';

import { Input, ValueWrapper } from './value.styles';

type Props = {
  predefined?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const Value: React.FC<Props> = ({ predefined, value, onChange }) => {
  return (
    <ValueWrapper>
      <Input
        className={classes('text', 'fullwidth', predefined && 'disabled')}
        readOnly={predefined}
        disabled={predefined}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </ValueWrapper>
  );
};
