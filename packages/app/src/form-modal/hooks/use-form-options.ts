import { useEffect, useState } from 'react';
import { FormOptionsResponse, FormStatus, FormTemplateCollection, FormType } from '../types/forms';
import axios from '@ff-app/config/axios';

type FormOptions = [FormType[], FormStatus[], FormTemplateCollection, boolean];

export const useFormOptions = (): FormOptions => {
  const [types, setTypes] = useState<FormType[]>(null);
  const [statuses, setStatuses] = useState<FormStatus[]>(null);
  const [templateCollection, setTemplateCollection] = useState<FormTemplateCollection>(null);
  const [ajaxByDefault, setAjaxByDefault] = useState(true);

  useEffect(() => {
    axios
      .get<FormOptionsResponse>('/api/forms/options')
      .then(({ data: { types, statuses, templates, ajax } }): void => {
        setTypes(types);
        setStatuses(statuses);
        setTemplateCollection(templates);
        setAjaxByDefault(ajax);
      });
  }, []);

  return [types, statuses, templateCollection, ajaxByDefault];
};
