import React from 'react';
import Skeleton from 'react-loading-skeleton';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { FieldMappingProperty } from '@ff-client/types/properties';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import RefreshIcon from './icons/refresh.svg';
import { FieldMappingController } from './mapping.controller';
import { RefreshButton } from './mapping.styles';
import type { SourceField } from './mapping.types';
import { extractParameter } from './mapping.utilities';

const FieldMapping: React.FC<ControlType<FieldMappingProperty>> = ({
  value = {},
  property,
  errors,
  updateValue,
  context,
}) => {
  const params: Record<string, string> = {};
  if (property.parameterFields) {
    Object.entries(property.parameterFields).forEach(([key, value]) => {
      params[value] = extractParameter(context, key);
    });
  }

  const { data, isFetching, refetch } = useQuery<
    unknown,
    unknown,
    SourceField[]
  >(
    ['field-mapping', property.source, params],
    () => axios.get(property.source, { params }).then((res) => res.data),
    { staleTime: Infinity, cacheTime: Infinity }
  );

  return (
    <Control property={property} errors={errors}>
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
      {data && (
        <FieldMappingController
          sources={data}
          mapping={value}
          updateValue={updateValue}
        />
      )}
      {!data && isFetching && (
        <div>
          <Skeleton width="40%" />
          <Skeleton width="35%" />
          <Skeleton width="42%" />
        </div>
      )}
    </Control>
  );
};

export default FieldMapping;
