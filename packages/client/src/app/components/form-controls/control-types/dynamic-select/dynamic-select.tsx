import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type {
  DynamicSelectProperty,
  OptionCollection,
} from '@ff-client/types/properties';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { extractParameter } from '../namespaced/field-mapping/mapping.utilities';

import RefreshIcon from './icons/refresh.svg';
import { RefreshButton } from './dynamic-select.styles';

const DynamicSelect: React.FC<ControlType<DynamicSelectProperty>> = ({
  value,
  property,
  errors,
  updateValue,
  context,
}) => {
  const { source, parameterFields, emptyOption } = property;

  const params: Record<string, string> = {};
  if (parameterFields) {
    Object.entries(parameterFields).forEach(([key, value]) => {
      params[value] = extractParameter(context, key);
    });
  }

  const { data, isFetching, refetch } = useQuery(
    ['dynamic-select', source, params],
    () =>
      axios.get<OptionCollection>(source, { params }).then((res) => res.data),
    { staleTime: Infinity, cacheTime: Infinity }
  );

  return (
    <Control property={property} errors={errors}>
      <Dropdown
        loading={isFetching}
        value={value}
        onChange={updateValue}
        emptyOption={emptyOption}
        options={data}
      />
      <RefreshButton
        className="btn"
        disabled={isFetching}
        onClick={() => {
          params['refresh'] = 'true';
          refetch();
          delete params['refresh'];
        }}
      >
        <RefreshIcon />
      </RefreshButton>
    </Control>
  );
};

export default DynamicSelect;
