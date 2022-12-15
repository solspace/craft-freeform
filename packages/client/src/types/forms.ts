import type { Cell, Layout, Page, Row } from '@editor/builder/types/layout';
import type { Field } from '@editor/store/slices/fields';
import type { GenericValue, Property } from '@ff-client/types/properties';

export type SettingsNamespace = Record<string, GenericValue>;

export type Form = {
  id?: number;
  uid: string;
  type: string;
  name: string;
  handle: string;
  settings: {
    [namespace: string]: SettingsNamespace;
  };
};

export type ExtendedFormType = Form & {
  layout: {
    fields: Field[];
    pages: Page[];
    layouts: Layout[];
    rows: Row[];
    cells: Cell[];
  };
};

export type Attribute = {
  index?: number;
  key: string;
  value?: string;
};

export type FormSettingGroup = {
  handle: string;
  label: string;
};

export type FormSettingNamespace = {
  label: string;
  handle: string;
  groups: FormSettingGroup[];
  properties: Property[];
};
