import type { GenericValue } from "@ff-client/types/properties";

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

export type FormGroup = {
  uid: string;
  label: string;
  order: number;
  siteId: string;
  entries: Array<{
    formUid: string;
    order: number;
  }>;
};

export type Favorite = {
  uid: string;
  label: string;
  type: string;
  metadata: GenericValue;
};

export type LimitedUser = {
  uid: string;
  name: string;
  description: string;
  metadata: GenericValue;
};

export type Submissions = {
  form: {
    uid: string;
    name: string;
  };
  count: number;
};

export type NotificationTemplate = {
  uid: string;
  id: number | string;
  formUid?: string;
  name: string;
  description: string;
};

export type PdfTemplate = {
  uid: string;
  id: number;
  name: string;
  description: string;
  fileName: string;
  body: string;
};

export type WrapperTemplate = {
  uid: string;
  id: number;
  name: string;
  handle: string;
  description: string;
  content: string;
};

export type FileTemplate = {
  filePath: string;
  fileName: string;
  name: string;
};

export type Integration = {
  uid: string;
  name: string;
  icon: string;
};

export type TemplateCollection = {
  pdf: PdfTemplate[];
  wrapper: WrapperTemplate[];
  notification: NotificationTemplate[];
  formatting: FileTemplate[];
  success: FileTemplate[];
};

export type FormImportData = {
  forms: Form[];
  favorites: Favorite[];
  formGroups: FormGroup[];
  limitedUsers: LimitedUser[];
  formSubmissions: Submissions[];
  templates: TemplateCollection;
  integrations: Integration[];
  settings: boolean;
};

export type ImportStrategy = "replace" | "skip";

export type StrategyCollection = {
  forms: ImportStrategy;
  templates: ImportStrategy;
};

export type TemplateValues = {
  pdf: string[];
  wrapper: string[];
  notification: string[];
  formatting: string[];
  success: string[];
};

export type ImportOptions = {
  forms: string[];
  favorites: string[];
  formGroups: string[];
  limitedUsers: string[];
  formSubmissions: string[];
  templates: TemplateValues;
  integrations: string[];
  strategy: StrategyCollection;
  settings: boolean;
  password?: string;
};

export const createImportOptions = (): ImportOptions => ({
  forms: [],
  favorites: [],
  formGroups: [],
  limitedUsers: [],
  formSubmissions: [],
  templates: {
    pdf: [],
    wrapper: [],
    notification: [],
    formatting: [],
    success: [],
  },
  integrations: [],
  strategy: {
    forms: "skip",
    templates: "skip",
  },
  settings: false,
});
