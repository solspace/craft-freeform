import React from 'react';
import { useStore } from 'react-redux';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type {
  AppStateSelectProperty,
  GenericValue,
  OptionCollection,
} from '@ff-client/types/properties';
import { filterTest } from '@ff-client/utils/filters';

import { extractParameter } from '../namespaced/field-mapping/mapping.utilities';

const AppStateSelect: React.FC<ControlType<AppStateSelectProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const { source, optionValue, optionLabel, filters, emptyOption } = property;

  const store = useStore();
  const state = store.getState();

  const targetList = extractParameter(state, source);

  const data: OptionCollection = [];
  targetList.forEach((item: GenericValue, index: string | number) => {
    if (!filterTest(filters, item)) {
      return;
    }

    data.push({
      label: optionLabel ? extractParameter(item, optionLabel) : item,
      value: optionValue ? extractParameter(item, optionValue) : index,
    });
  });

  return (
    <Control property={property} errors={errors}>
      <Dropdown
        value={value}
        onChange={updateValue}
        emptyOption={emptyOption}
        options={data}
      />
    </Control>
  );
};

export default AppStateSelect;
