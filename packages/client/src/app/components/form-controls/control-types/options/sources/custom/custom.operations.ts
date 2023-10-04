import update from 'immutability-helper';

import type { CustomOptionsConfiguration, Option } from '../../options.types';

export const addOption = (
  value: CustomOptionsConfiguration,
  atIndex: number
): CustomOptionsConfiguration => ({
  ...value,
  options: [
    ...value.options.slice(0, atIndex),
    { label: '', value: '' },
    ...value.options.slice(atIndex),
  ],
});

export const updateOption = (
  index: number,
  option: Option,
  value: CustomOptionsConfiguration
): CustomOptionsConfiguration => {
  const options = [...value.options];
  options[index] = option;

  return {
    ...value,
    options,
  };
};

export const deleteOption = (
  index: number,
  value: CustomOptionsConfiguration
): CustomOptionsConfiguration => {
  const options = value.options.filter(
    (_, optionIndex) => optionIndex !== index
  );

  return {
    ...value,
    options,
  };
};

export const updateChecked = (
  index: number,
  option: Option,
  value: CustomOptionsConfiguration
): CustomOptionsConfiguration => {
  const options = value.options.map((option) => ({ ...option }));
  options[index] = option;

  return {
    ...value,
    options,
  };
};

export const cleanOptions = (
  value: CustomOptionsConfiguration
): CustomOptionsConfiguration => {
  return {
    ...value,
    options: value.options.filter((option) => !!option.label || !!option.value),
  };
};

export const toggleUseCustomValues = (
  value: CustomOptionsConfiguration,
  useCustomValues: boolean
): CustomOptionsConfiguration => {
  if (useCustomValues) {
    return {
      ...value,
      useCustomValues,
    };
  }

  return {
    ...value,
    useCustomValues,
    options: value.options.map((option) => ({
      ...option,
      value: option.label,
    })),
  };
};

export const moveOption = (
  value: CustomOptionsConfiguration,
  fromIndex: number,
  toIndex: number
): CustomOptionsConfiguration => {
  const prevOptions = [...value.options];

  return {
    ...value,
    options: update(prevOptions, {
      $splice: [
        [fromIndex, 1],
        [toIndex, 0, prevOptions[fromIndex] as Option],
      ],
    }),
  };
};
