import React, { useState } from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import { FormComponent } from '@components/form-controls';
import { Control } from '@components/form-controls/control';
import { FlexColumn } from '@components/layout/blocks/flex';
import type { GenericValue } from '@ff-client/types/properties';
import { PropertyType } from '@ff-client/types/properties';

import type { ElementOptionsConfiguration } from '../../options.types';

import { useOptionTypesPredefined } from './predefined.queries';

type Props = {
  value: ElementOptionsConfiguration;
  updateValue: (value: ElementOptionsConfiguration) => void;
};

const Predefined: React.FC<Props> = ({ value, updateValue }) => {
  const [typeClass, setTypeClass] = useState(value.typeClass);
  const { data, isFetching } = useOptionTypesPredefined();

  const selectedTypeProvider = data?.find(
    (type) => type.typeClass === typeClass
  );

  return (
    <FlexColumn>
      <Control
        property={{
          type: PropertyType.Select,
          label: 'Type',
          handle: 'predefinedOptionTypeClass',
          options: [],
        }}
      >
        <Dropdown
          emptyOption="Choose type"
          loading={isFetching}
          value={value.typeClass}
          onChange={(selectedValue) => {
            const properties: GenericValue = {};
            const provider = data?.find(
              (type) => type.typeClass === selectedValue
            );

            if (provider) {
              provider.properties.map((property) => {
                properties[property.handle] = property.value;
              });
            }

            setTypeClass(selectedValue);
            updateValue({
              ...value,
              typeClass: selectedValue,
              properties,
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
        selectedTypeProvider.properties.map((property) => {
          let currentPropertyValue = '';
          if (value?.properties?.[property.handle] !== undefined) {
            currentPropertyValue = value.properties[property.handle];
          } else if (property.value !== undefined) {
            currentPropertyValue = property.value as string;
          }

          return (
            <FormComponent
              key={property.handle}
              property={property}
              context={value}
              value={currentPropertyValue}
              updateValue={(selectedValue) => {
                updateValue({
                  ...value,
                  properties: {
                    ...value.properties,
                    [property.handle]: selectedValue,
                  },
                });
              }}
            />
          );
        })}
    </FlexColumn>
  );
};

export default Predefined;
