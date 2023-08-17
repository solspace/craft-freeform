import type { OptionsConfiguration } from '../options.types';
import { Source } from '../options.types';

export const generateDefaultValue = (source: Source): OptionsConfiguration => {
  switch (source) {
    case Source.Elements:
      return {
        source: Source.Elements,
        typeClass: '',
        properties: {},
      };

    case Source.Predefined:
      return {
        source: Source.Predefined,
        typeClass: '',
        properties: {},
      };

    case Source.Custom:
    default:
      return {
        source: Source.Custom,
        useCustomValues: false,
        options: [],
      };
  }
};
