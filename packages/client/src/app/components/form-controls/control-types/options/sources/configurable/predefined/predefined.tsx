import React from 'react';

import type {
  ConfigurableOptionsConfiguration,
  OptionsConfiguration,
} from '../../../options.types';
import { ConfigurableOptions } from '../configurable';

import { useOptionTypesPredefined } from './predefined.queries';

type Props = {
  value: ConfigurableOptionsConfiguration;
  updateValue: (value: OptionsConfiguration) => void;
};

const Predefined: React.FC<Props> = ({ value, updateValue }) => {
  return (
    <ConfigurableOptions
      value={value}
      updateValue={updateValue}
      typeProviderQuery={useOptionTypesPredefined}
    />
  );
};

export default Predefined;
