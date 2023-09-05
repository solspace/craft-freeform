import React from 'react';

import type {
  ConfigurableOptionsConfiguration,
  ConfigurationProps,
} from '../../../options.types';
import { ConfigurableOptions } from '../configurable';

import { useOptionTypesPredefined } from './predefined.queries';

const Predefined: React.FC<
  ConfigurationProps<ConfigurableOptionsConfiguration>
> = ({ value, updateValue }) => {
  return (
    <ConfigurableOptions
      value={value}
      updateValue={updateValue}
      defaultValue={''}
      updateDefaultValue={() => {}}
      typeProviderQuery={useOptionTypesPredefined}
    />
  );
};

export default Predefined;
