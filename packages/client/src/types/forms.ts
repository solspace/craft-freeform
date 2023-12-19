import type { Layout, Page, Row } from '@editor/builder/types/layout';
import type { Field } from '@editor/store/slices/layout/fields';
import type {
  GenericValue,
  Property,
  Section,
} from '@ff-client/types/properties';

export type SettingsNamespace = Record<string, GenericValue>;

export type Form = {
  id?: number;
  uid: string;
  type: string;
  name: string;
  handle: string;
  isNew: boolean;
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
  };
};

export type FormSettingNamespace = {
  label: string;
  handle: string;
  order: number;
  sections: Section[];
  properties: Property[];
};

export type FormOwnership = {
  dateCreated: string;
  dateUpdated: string;
}
