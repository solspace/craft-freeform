import React from 'react';
import translate from '@ff-client/utils/translations';

type Props = {
  value: boolean;
  onChange?: (value: boolean) => void;
  options: {
    on: string;
    off: string;
  };
};

export const DisplayTriggerDropdown: React.FC<Props> = ({
  value,
  onChange,
  options,
}) => {
  const { on, off } = options;

  return (
    <div className="select">
      <select
        value={value ? on : off}
        onChange={(event) => onChange && onChange(event.target.value === on)}
      >
        <option value={on}>{translate(on)}</option>
        <option value={off}>{translate(off)}</option>
      </select>
    </div>
  );
};
