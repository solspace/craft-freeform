import React from 'react';
import { Control, ControlProps } from '../control';

export const Text: React.FC<ControlProps<string>> = (props) => {
  const { id, value, onChange } = props;

  return (
    <Control id={id} value={value} {...props}>
      <input
        id={id}
        type="text"
        className="text fullwidth"
        onChange={(event): void => onChange && onChange(event.target.value)}
        value={value || ''}
      />
    </Control>
  );
};
