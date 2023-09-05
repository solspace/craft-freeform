import React from 'react';
import translate from '@ff-client/utils/translations';

type Props = {
  fieldUid: string;
  onChange?: (value: string) => void;
  value: string;
};

export const BooleanValueRule: React.FC<Props> = ({
  fieldUid,
  onChange,
  value,
}) => {
  return (
    <div className="checkbox-wrapper">
      <input
        id={`${fieldUid}-rule-checkbox`}
        type="checkbox"
        className="checkbox"
        onChange={(event) =>
          onChange && onChange(event.target.checked ? '1' : '')
        }
        checked={Boolean(value)}
      />
      <label htmlFor={`${fieldUid}-rule-checkbox`}>
        {translate(value ? 'Checked' : 'Unchecked')}
      </label>
    </div>
  );
};
