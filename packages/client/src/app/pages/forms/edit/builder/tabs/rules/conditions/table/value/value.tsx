import React from 'react';
import { useSelector } from 'react-redux';
import type { Option } from '@components/form-controls/control-types/options/options.types';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import type { Condition } from '@ff-client/types/rules';
import { operatorTypes } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';

type Props = {
  condition: Condition;
  onChange?: (value: string) => void;
};

export const ValueInput: React.FC<Props> = ({ condition, onChange }) => {
  const { field: fieldUid, value, operator } = condition;

  const field = useSelector(fieldSelectors.one(fieldUid));
  const fieldType = useFieldType(field?.typeClass);

  if (!fieldType) {
    return null;
  }

  const isBoolean =
    fieldType.implements.includes('boolean') &&
    operatorTypes.boolean.includes(operator);

  if (isBoolean) {
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
  }

  if (fieldType.implements.includes('options')) {
    return (
      <div className="select fullwidth">
        <select
          value={value}
          onChange={(event) => onChange && onChange(event.target.value)}
        >
          {field.properties.options.options.map(
            (option: Option, idx: number) => (
              <option key={idx} value={option.value}>
                {option.label}
              </option>
            )
          )}
        </select>
      </div>
    );
  }

  return (
    <div>
      <input
        className="text fullwidth"
        type="text"
        value={value}
        onChange={(event) => onChange && onChange(event.target.value)}
      />
    </div>
  );
};
