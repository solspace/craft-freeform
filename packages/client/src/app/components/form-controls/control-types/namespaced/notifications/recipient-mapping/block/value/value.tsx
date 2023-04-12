import React from 'react';

import { ValueWrapper } from './value.styles';

type Props = {
  predefined?: boolean;
  value: string;
  onChange: (value: string) => void;
};

export const Value: React.FC<Props> = ({ predefined, value, onChange }) => {
  return (
    <ValueWrapper>
      <input
        className="text fullwidth"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </ValueWrapper>
  );
};
