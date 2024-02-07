import React from 'react';
import { useSelector } from 'react-redux';
import { fieldSelectors } from '@editor/store/slices/layout/fields/fields.selectors';
import { useFieldType } from '@ff-client/queries/field-types';
import { Type } from '@ff-client/types/fields';
import type { Condition } from '@ff-client/types/rules';
import { operatorTypes } from '@ff-client/types/rules';

import { BooleanValueRule } from './boolean/boolean';
import { GeneratedOptionsRuleValue } from './generated-options/generated-options';
import { OpinionScaleRuleValue } from './opinion-scale/opinion-scale';
import { RatingRuleValue } from './rating/rating';

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

  const isNoValueCheck = operatorTypes.noValue.includes(operator);
  if (isNoValueCheck) {
    return null;
  }

  const isBoolean =
    fieldType.implements.includes('boolean') &&
    operatorTypes.boolean.includes(operator);

  if (isBoolean) {
    return (
      <BooleanValueRule fieldUid={fieldUid} onChange={onChange} value={value} />
    );
  }

  if (fieldType.implements.includes('generatedOptions')) {
    return (
      <GeneratedOptionsRuleValue
        field={field}
        fieldType={fieldType}
        value={value}
        onChange={(selectedValue) => onChange && onChange(selectedValue)}
      />
    );
  }

  const typeShorthand = fieldType.type as Type;

  if (typeShorthand === Type.Rating) {
    return <RatingRuleValue field={field} value={value} onChange={onChange} />;
  }

  if (typeShorthand === Type.OpinionScale) {
    return (
      <OpinionScaleRuleValue field={field} value={value} onChange={onChange} />
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
