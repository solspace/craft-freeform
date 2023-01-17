import type { CustomOptions } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/custom-options.types';
import type optionsSources from '@editor/builder/tabs/layout-editor/property-editor/form-controls/options/options-sources';
import type { GenericValue } from '@ff-client/types/properties';

export type OptionsSources = typeof optionsSources[number]['key'] | '';

export type CustomControlProps = {
  handle: string;
  value: GenericValue;
  onChange: (value: GenericValue) => void;
};

export type OptionsEditorProps = {
  source?: OptionsSources;
  options?: CustomOptions | GenericValue;
};
