import type { CustomOptionsConfiguration, Option } from '../../options.types';

export const addOption = (
  value: CustomOptionsConfiguration,
  atIndex: number
): CustomOptionsConfiguration => ({
  ...value,
  options: [
    ...value.options.slice(0, atIndex),
    { label: '', value: '', checked: false },
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
  const options = value.options.map((option) => ({
    ...option,
    checked: false,
  }));

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
