export type FormStatus = {
  id: number;
  name: string;
  isDefault: boolean;
};

export type FormTemplateCollection = {
  native: FormTemplate[];
  custom: FormTemplate[];
};

export type FormTemplate = {
  id: string;
  name: string;
};

export type FormType = {
  name: string;
  className: string;
  properties: string[];
};

export type FormOptionsResponse = {
  types: FormType[];
  statuses: FormStatus[];
  templates: FormTemplateCollection;
};
