import React, { useState } from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { FormComponent } from '@components/form-controls';
import { Control } from '@components/form-controls/control';
import { FlexColumn } from '@components/layout/blocks/flex';
import { PropertyType } from '@ff-client/types/properties';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { ElementOptionsConfiguration } from '../../options.types';

import type { ElementType } from './elements.types';

type Props = {
  value: ElementOptionsConfiguration;
  updateValue: (value: ElementOptionsConfiguration) => void;
};

const Elements: React.FC<Props> = ({ value, updateValue }) => {
  const [typeClass, setTypeClass] = useState(value.typeClass);

  const { data, isFetching } = useQuery<ElementType[]>(
    ['elements'],
    () => axios.get('/api/types/options/elements').then((res) => res.data),
    { staleTime: Infinity }
  );

  const selectedElementType = data?.find(
    (element) => element.typeClass === typeClass
  );

  return (
    <FlexColumn>
      <Control
        property={{
          type: PropertyType.Select,
          label: 'Element Type',
          handle: 'elementOptionTypeClass',
          options: [],
        }}
      >
        <Dropdown
          emptyOption="Choose Element type"
          loading={isFetching}
          value={value.typeClass}
          onChange={(selectedValue) => {
            setTypeClass(selectedValue);
            updateValue({
              ...value,
              typeClass: selectedValue,
            });
          }}
          options={
            data &&
            data.map((element) => ({
              label: element.label,
              value: element.typeClass,
            }))
          }
        />
      </Control>

      {selectedElementType &&
        selectedElementType.properties.map((property) => (
          <FormComponent
            key={property.handle}
            property={property}
            context={value}
            value={
              value?.properties?.[property.handle] || property?.value || ''
            }
            updateValue={(selectedValue) =>
              updateValue({
                ...value,
                properties: {
                  ...value.properties,
                  [property.handle]: selectedValue,
                },
              })
            }
          />
        ))}
    </FlexColumn>
  );
};

export default Elements;
