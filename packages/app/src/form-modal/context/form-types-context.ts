import { createContext } from 'react';
import { FormStatus, FormTemplateCollection, FormType } from '../types/forms';

type FormOptionsContextProps = {
  types: FormType[];
  statuses: FormStatus[];
  templates: FormTemplateCollection;
  ajaxByDefault: boolean;
};

export const FormOptionsContext = createContext<FormOptionsContextProps>({
  types: null,
  statuses: null,
  templates: null,
  ajaxByDefault: true,
});

FormOptionsContext.displayName = 'Form Options Context';
