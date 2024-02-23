type Field = {
  uid: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  default_value: string;
  name: string;
  handle: string;
  position: number;
};

type Row = {
  uid: string;
  fields: Field[];
};

type Page = {
  uid: string;
  label: string;
  layout: {
    uid: string;
    rows: Row[];
  };
};

type Form = {
  uid: string;
  name: string;
  handle: string;
  pages: Page[];
};

export type FormImportData = {
  forms: Form[];
  notifications: string[];
  integrations: string[];
  settings: string[];
};

export type ImportOptions = {
  forms: string[];
  notifications: string[];
  integrations: string[];
};
