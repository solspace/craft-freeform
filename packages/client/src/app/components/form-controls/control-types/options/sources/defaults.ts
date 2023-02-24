import type { Options } from '../options.types';
import { Source } from '../options.types';

export const generateDefaultValue = (source: Source): Options => {
  switch (source) {
    case Source.CustomOptions:
      return {
        source: Source.CustomOptions,
        useCustomValues: false,
        options: [],
      };

    default:
      return {
        source,
      };
  }
};
