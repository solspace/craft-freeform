import { useEffect, useState } from 'react';
import type {
  Option,
  OptionCollection,
  OptionGroup,
} from '@ff-client/types/properties';

const filterOptions = (
  options: OptionCollection,
  query: string,
  indexOffset = 0
): [OptionCollection, number] => {
  let index = indexOffset;

  return [
    options
      ?.map((option): Option | OptionGroup => {
        if ('value' in option) {
          const hasMatch =
            !query || option.label.toLowerCase().includes(query.toLowerCase());
          if (hasMatch) {
            option.shadowIndex = index++;

            return option;
          }
        }

        if ('children' in option) {
          const [children, nestedIndex] = filterOptions(
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
      .filter(Boolean),
    index,
  ];
};

export const useFilteredOptions = (
  options: OptionCollection,
  query: string
): [OptionCollection, number] => {
  const [optionCount, setOptionCount] = useState<number>(0);
  const [filteredOptions, setFilteredOptions] =
    useState<OptionCollection>(options);

  useEffect(() => {
    const [filteredOpts, optCount] = filterOptions(options, query);
    setFilteredOptions(filteredOpts);
    setOptionCount(optCount);
  }, [query]);

  return [filteredOptions, optionCount];
};
