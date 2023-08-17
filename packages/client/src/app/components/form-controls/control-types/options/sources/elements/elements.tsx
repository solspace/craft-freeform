import React, { useState } from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { FormComponent } from '@components/form-controls';
import { Control } from '@components/form-controls/control';
import { FlexColumn } from '@components/layout/blocks/flex';
import { PropertyType } from '@ff-client/types/properties';

import type { ElementOptionsConfiguration } from '../../options.types';

import { useOptionTypesElements } from './elements.queries';

type Props = {
  value: ElementOptionsConfiguration;
  updateValue: (value: ElementOptionsConfiguration) => void;
};

const Elements: React.FC<Props> = ({ value, updateValue }) => {
  const [typeClass, setTypeClass] = useState(value.typeClass);
  const { data, isFetching } = useOptionTypesElements();

  const selectedTypeProvider = data?.find(
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
              properties: {},
            });
          }}
          options={
            data &&
            data.map((typeProvider) => ({
              label: typeProvider.name,
              value: typeProvider.typeClass,
            }))
          }
        />
      </Control>

      {selectedTypeProvider &&
        selectedTypeProvider.properties.map((property) => (
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
