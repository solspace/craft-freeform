import type { CustomOptions, Option } from '../../options.types';

export const addOption = (value: CustomOptions): CustomOptions => ({
  ...value,
  options: [
    ...(value.options || []),
    {
      label: '',
      value: '',
      checked: false,
    },
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

export const dragAndDropOption = (
  index: number,
  value: CustomOptions
): void => {
  // TODO: Implement
};
