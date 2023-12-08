import { useEffect, useState } from 'react';
import type {
  Option,
  OptionCollection,
  OptionGroup,
} from '@ff-client/types/properties';

const filterOptions = (
  value: string[],
  options: OptionCollection,
  query: string,
  indexOffset = 0
): [OptionCollection, number] => {
  let index = indexOffset;

  const filteredOpts =
    options
      ?.map((option): Option | OptionGroup => {
        if ('value' in option) {
          const hasMatch =
            !query || option.label.toLowerCase().includes(query.toLowerCase());
          if (hasMatch) {
            return {
              ...option,
              shadowIndex: index++,
            };
          }
        }

        if ('children' in option) {
          const [children, nestedIndex] = filterOptions(
            value,
            option.children,
            query,
            index
          );

          if (children.length) {
            index = nestedIndex;

            return {
              ...option,
              children,
            };
          }
        }

        return null;
      })
      .filter(Boolean) || [];

  return [filteredOpts, index];
};

export const useFilteredOptions = (
  value: string[],
  options: OptionCollection,
  query: string
): [OptionCollection, number] => {
  const [optionCount, setOptionCount] = useState<number>(0);
  const [filteredOptions, setFilteredOptions] =
    useState<OptionCollection>(options);

  useEffect(() => {
    const [filteredOpts, optCount] = filterOptions(value, options, query);

    setFilteredOptions(filteredOpts);
    setOptionCount(optCount);
  }, [value, options, query]);

  return [filteredOptions, optionCount];
};
