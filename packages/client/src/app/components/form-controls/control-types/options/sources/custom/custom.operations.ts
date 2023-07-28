import type { CustomOptions, Option } from '../../options.types';

export const addOption = (
  value: CustomOptions,
  atIndex: number
): CustomOptions => ({
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
  value: CustomOptions
): CustomOptions => {
  const options = [...value.options];
  options[index] = option;

  return {
    ...value,
    options,
  };
};

export const deleteOption = (
  index: number,
  value: CustomOptions
): CustomOptions => {
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
  value: CustomOptions
): CustomOptions => {
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

export const cleanOptions = (value: CustomOptions): CustomOptions => {
  return {
    ...value,
    options: value.options.filter((option) => !!option.label || !!option.value),
  };
};
