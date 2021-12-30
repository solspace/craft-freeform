import { useEffect, useState } from 'react';
import { FormOptionsResponse, FormStatus, FormTemplateCollection, FormType } from '../types/forms';
import axios from '@ff-app/config/axios';

type FormOptions = [FormType[], FormStatus[], FormTemplateCollection];

export const useFormOptions = (): FormOptions => {
  const [types, setTypes] = useState<FormType[]>(null);
  const [statuses, setStatuses] = useState<FormStatus[]>(null);
  const [templateCollection, setTemplateCollection] = useState<FormTemplateCollection>(null);

  useEffect(() => {
    axios.get<FormOptionsResponse>('/api/forms/options').then(({ data: { types, statuses, templates } }): void => {
      setTypes(types);
      setStatuses(statuses);
      setTemplateCollection(templates);
    });
  }, []);

  return [types, statuses, templateCollection];
};
