import React from 'react';
import { useParams } from 'react-router-dom';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import type { Condition } from '@ff-client/types/rules';
import translate from '@ff-client/utils/translations';
type Props = {
  condition: Condition;
  onChange: (fieldUid: string) => void;
};

import { useSelector } from 'react-redux';
import { useFieldOptionCollection } from '@editor/store/slices/layout/fields/fields.hooks';
import { fieldRuleSelectors } from '@editor/store/slices/rules/fields/field-rules.selectors';

export const FieldSelect: React.FC<Props> = ({ condition, onChange }) => {
  const { uid } = useParams();

  const usedBy = useSelector(fieldRuleSelectors.usedByFields(uid));
  const options = useFieldOptionCollection([...usedBy, uid]);

  return (
    <Dropdown
      options={options}
      emptyOption={translate('Choose field')}
      value={condition.field}
      onChange={onChange}
    />
  );
};
