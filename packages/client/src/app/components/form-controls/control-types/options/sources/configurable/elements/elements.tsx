import React from 'react';

import type {
  ConfigurableOptionsConfiguration,
  ConfigurationProps,
} from '../../../options.types';
import { ConfigurableOptions } from '../configurable';

import { useOptionTypesElements } from './elements.queries';

const Elements: React.FC<
  ConfigurationProps<ConfigurableOptionsConfiguration>
> = ({ value, updateValue, convertToCustomValues }) => {
  return (
    <ConfigurableOptions
      value={value}
      updateValue={updateValue}
      defaultValue={''}
      updateDefaultValue={() => {}}
      typeProviderQuery={useOptionTypesElements}
      convertToCustomValues={convertToCustomValues}
    />
  );
};

export default Elements;
