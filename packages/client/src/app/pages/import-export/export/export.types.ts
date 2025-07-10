import type { FormImportData, ImportOptions } from '../import/import.types';

export type ExportOptions = Omit<ImportOptions, 'strategy'>;

export const createExportOptions = (): ExportOptions => ({
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
  settings: false,
  password: '',
});

export const createFilledExportOptions = (
  data: FormImportData
): ExportOptions => ({
  forms: data.forms.map((form) => form.uid),
  formGroups: data?.formGroups?.map((group) => group.uid) || [],
  favorites: data?.favorites?.map((favorite) => favorite.uid) || [],
  limitedUsers: data?.limitedUsers?.map((user) => user.uid) || [],
  templates: {
    pdf: data.templates.pdf.map((template) => template.uid),
    wrapper: data.templates.wrapper.map((template) => template.uid),
    notification: data.templates.notification.map((template) => template.uid),
    formatting: data.templates.formatting.map((template) => template.fileName),
    success: data.templates.success.map((template) => template.fileName),
  },
  integrations: data.integrations.map((integration) => integration.uid),
  formSubmissions: data.formSubmissions.map(
    (submission) => submission.form.uid
  ),
  settings: true,
});
