import React from 'react';
import { Combinator } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';

type Props = {
  value: Combinator;
  onChange?: (value: Combinator) => void;
};

export const CombinatorSelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <div className="select">
      <select
        value={value}
        onChange={(event) =>
          onChange && onChange(event.target.value as Combinator)
        }
      >
        <option value={Combinator.Or}>{translate('any')}</option>
        <option value={Combinator.And}>{translate('all')}</option>
      </select>
    </div>
  );
};
