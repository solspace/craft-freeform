import type { Layout, Page, Row } from '@editor/builder/types/layout';
import type { Field } from '@editor/store/slices/layout/fields';
import type {
  GenericValue,
  Property,
  Section,
} from '@ff-client/types/properties';

export type SettingsNamespace = Record<string, GenericValue>;

type FormOwnershipMeta = {
  datetime: string;
  user: {
    id: number;
    url: string;
    name: string;
  };
};

type FormOwnership = {
  created: FormOwnershipMeta;
  updated: FormOwnershipMeta;
};

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
  ownership?: FormOwnership;
  dateArchived: string | null;
};

export type ExtendedFormType = Form & {
  translations: Record<
    number,
    {
      fields: Record<string, string>;
      form: Record<string, string>;
      buttons: Record<string, string>;
    }
  >;
  layout: {
    fields: Field[];
    pages: Page[];
    layouts: Layout[];
    rows: Row[];
  };
};

export type FormWithStats = Form & {
  links: Array<{
    label: string;
    handle: string;
    url: string;
    type: string;
    count: number;
    internal: boolean;
  }>;
  chartData: Array<{ uv: number }>;
  counters: {
    submissions: number;
    spam: number;
  };
};

export type FormSettingNamespace = {
  label: string;
  handle: string;
  order: number;
  sections: Section[];
  properties: Property[];
};
