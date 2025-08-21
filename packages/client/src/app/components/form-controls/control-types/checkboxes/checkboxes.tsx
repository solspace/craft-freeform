import React from 'react';
import { Checkboxes as CheckboxesElement } from '@components/elements/checkboxes/checkboxes';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { CheckboxesProperty } from '@ff-client/types/properties';
import { translate } from '@ff-client/utils/translations';

const Checkboxes: React.FC<ControlType<CheckboxesProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { handle, options, selectAll, columns } = property;

  return (
    <Control property={property} errors={errors}>
      <CheckboxesElement
        value={value}
        selectAll={selectAll}
        options={options}
        emptyMessage={translate('No options available')}
        uniqueId={handle}
        columns={columns}
        onUpdate={updateValue}
      />
    </Control>
  );
};

export default Checkboxes;
