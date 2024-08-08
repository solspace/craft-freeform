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
  form: {
    uid: string;
    name: string;
  };
  count: number;
};

export type NotificationTemplate = {
  uid: number | string;
  id: number | string;
  name: string;
  description: string;
};

export type Integration = {
  uid: string;
  name: string;
  icon: string;
};

export type FormImportData = {
  forms: Form[];
  formSubmissions: Submissions[];
  notificationTemplates: NotificationTemplate[];
  integrations: Integration[];
  settings: string[];
};

export type ImportStrategy = 'replace' | 'skip';

export type StrategyCollection = {
  forms: ImportStrategy;
  notifications: ImportStrategy;
};

export type ImportOptions = {
  forms: string[];
  formSubmissions: string[];
  notificationTemplates: Array<string | number>;
  integrations: string[];
  strategy: StrategyCollection;
  settings: boolean;
  password?: string;
};
