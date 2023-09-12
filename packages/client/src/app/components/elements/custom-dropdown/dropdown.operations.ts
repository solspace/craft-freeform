import { useEffect, useState } from 'react';
import type {
  Option,
  OptionCollection,
  OptionGroup,
} from '@ff-client/types/properties';

export const isInOptions = (
  options: OptionCollection,
  value: string
): boolean => {
  if (!options) {
    return false;
  }

  for (const option of options) {
    if ('value' in option) {
      if (String(option.value) === String(value)) {
        return true;
      }
    }

    if ('children' in option) {
      if (isInOptions(option.children, value)) {
        return true;
      }
    }
  }

  return false;
};

export const findFirstValue = (
  options: OptionCollection
): string | undefined => {
  if (!options) {
    return;
  }

  for (const option of options) {
    if ('value' in option) {
      return option.value;
    }

    if ('children' in option) {
      const value = findFirstValue(option.children);
      if (value !== undefined) {
        return value;
      }
    }
  }
};

export const findLabelByValue = (
  options: OptionCollection,
  value: string
): string | undefined => {
  if (!options) {
    return;
  }

  for (const option of options) {
    if ('value' in option) {
      if (String(option.value) === String(value)) {
        return option.label;
      }
    }

    if ('children' in option) {
      const label = findLabelByValue(option.children, value);
      if (label !== undefined) {
        return label;
      }
    }
  }
};

export const findShadowIndexByValue = (
  options: OptionCollection,
  value: string
): number | undefined => {
  if (!options) {
    return;
  }

  for (const option of options) {
    if ('value' in option) {
      if (String(option.value) === String(value)) {
        return option.shadowIndex;
      }
    }

    if ('children' in option) {
      return findShadowIndexByValue(option.children, value);
    }
  }
};

export const findValueByShadowIndex = (
  options: OptionCollection,
  shadowIndex: number
): string | undefined => {
  if (!options) {
    return;
  }

  for (const option of options) {
    if ('shadowIndex' in option) {
      if (option.shadowIndex === shadowIndex) {
        return option.value;
      }
    }

    if ('children' in option) {
      const value = findValueByShadowIndex(option.children, shadowIndex);
      if (value !== undefined) {
        return value;
      }
    }
  }
};

const filterOptions = (
  options: OptionCollection,
  query: string,
  indexOffset = 0,
  emptyOption?: string
): [OptionCollection, number] => {
  let index = indexOffset;

  let emptyOpt: Option | undefined;
  if (emptyOption !== undefined && emptyOption !== null && !query) {
    emptyOpt = {
      label: emptyOption,
      value: '',
      shadowIndex: index++,
    };
  }

  const filteredOpts =
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
      .filter(Boolean) || [];

  if (emptyOpt) {
    filteredOpts.unshift(emptyOpt);
  }

  return [filteredOpts, index];
};

export const useFilteredOptions = (
  options: OptionCollection,
  query: string,
  emptyOption?: string
): [OptionCollection, number] => {
  const [optionCount, setOptionCount] = useState<number>(0);
  const [filteredOptions, setFilteredOptions] =
    useState<OptionCollection>(options);

  useEffect(() => {
    const [filteredOpts, optCount] = filterOptions(
      options,
      query,
      undefined,
      emptyOption
    );

    setFilteredOptions(filteredOpts);
    setOptionCount(optCount);
  }, [options, query]);

  return [filteredOptions, optionCount];
};
