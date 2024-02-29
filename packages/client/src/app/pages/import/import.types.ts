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

export type Submissions = {
  formUid: string;
  count: number;
};

export type NotificationTemplate = {
  originalId: number | string;
  name: string;
  description: string;
};

export type FormImportData = {
  forms: Form[];
  formSubmissions: Submissions[];
  notificationTemplates: NotificationTemplate[];
  integrations: string[];
  settings: string[];
};

export type ImportStrategy = 'replace' | 'skip';

export type ImportOptions = {
  forms: string[];
  formSubmissions: string[];
  notificationTemplates: Array<string | number>;
  integrations: string[];
  strategy: {
    forms: ImportStrategy;
    notifications: ImportStrategy;
  };
};
