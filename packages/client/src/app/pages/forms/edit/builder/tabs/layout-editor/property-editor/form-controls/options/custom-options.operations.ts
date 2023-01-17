import type {
  CustomOptions,
  Option,
} from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/custom-options.types';

export const addOption = (
  options: Option[],
  value: CustomOptions,
  onChange: (value: CustomOptions) => void
): void => {
  const updatedOptions = [...options];

  updatedOptions.push({
    label: '',
    value: '',
    checked: false,
  });

  onChange({
    ...value,
    options: updatedOptions,
  });
};

export const updateOption = (
  index: number,
  option: Option,
  value: CustomOptions,
  onChange: (value: CustomOptions) => void
): void => {
  const options = [...value.options];
  options[index] = option;

  onChange({
    ...value,
    options,
  });
};

export const deleteOption = (
  index: number,
  value: CustomOptions,
  onChange: (value: CustomOptions) => void
): void => {
  const options = value.options.filter(
    (option, optionIndex) => optionIndex !== index
  );

  onChange({
    ...value,
    options,
  });
};

export const updateChecked = (
  index: number,
  option: Option,
  value: CustomOptions,
  onChange: (value: CustomOptions) => void
): void => {
  const options = value.options.map((option) => ({
    ...option,
    checked: false,
  }));

  options[index] = option;

  onChange({
    ...value,
    options,
  });
};

export const dragAndDropOption = (
  index: number,
  value: CustomOptions,
  onChange: (value: CustomOptions) => void
): void => {
  // TODO: Implement
};
