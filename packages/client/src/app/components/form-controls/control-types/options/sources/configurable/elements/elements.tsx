import React from 'react';

import type {
  ConfigurableOptionsConfiguration,
  OptionsConfiguration,
} from '../../../options.types';
import { ConfigurableOptions } from '../configurable';

import { useOptionTypesElements } from './elements.queries';

type Props = {
  value: ConfigurableOptionsConfiguration;
  updateValue: (value: OptionsConfiguration) => void;
};

const Elements: React.FC<Props> = ({ value, updateValue }) => {
  return (
    <ConfigurableOptions
      value={value}
      updateValue={updateValue}
      typeProviderQuery={useOptionTypesElements}
    />
  );
};

export default Elements;
