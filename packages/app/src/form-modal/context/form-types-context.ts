import { createContext } from 'react';
import { FormStatus, FormTemplateCollection, FormType } from '../types/forms';

type FormOptionsContextProps = {
  types: FormType[];
  statuses: FormStatus[];
  templates: FormTemplateCollection;
};

export const FormOptionsContext = createContext<FormOptionsContextProps>({
  types: null,
  statuses: null,
  templates: null,
});

FormOptionsContext.displayName = 'Form Options Context';
