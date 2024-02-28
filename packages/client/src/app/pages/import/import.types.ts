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

export type Form = {
  uid: string;
  name: string;
  handle: string;
  pages: Page[];
};

export type NotificationTemplate = {
  originalId: number | string;
  name: string;
  description: string;
};

export type FormImportData = {
  forms: Form[];
  notificationTemplates: NotificationTemplate[];
  integrations: string[];
  settings: string[];
};

export type ImportOptions = {
  forms: string[];
  notificationTemplates: Array<string | number>;
  integrations: string[];
};
