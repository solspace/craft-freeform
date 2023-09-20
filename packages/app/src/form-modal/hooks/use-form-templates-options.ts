import { useContext, useEffect, useState } from 'react';

import { SelectOption } from '@ff-app/shared/Forms/Select/Select';

import { FormOptionsContext } from '../context/form-types-context';
import { FormTemplate } from '../types/forms';

export const templateOptionMapper = ({ name, id }: FormTemplate): SelectOption => ({ label: name, value: id });

const extractTemplates = (templates: FormTemplate[]): SelectOption[] => {
  const nativeTemplates = templates.map(templateOptionMapper);

  return nativeTemplates;
};

export const useFormTemplatesOptions = (): [string, SelectOption[]] => {
  const { templates } = useContext(FormOptionsContext);

  const [templateList, setTemplateList] = useState<SelectOption[]>([]);
  const [defaultTemplate, setDefaultTemplate] = useState<string>('');

  useEffect((): void => {
    setDefaultTemplate(templates?.default || '');

    if (templates === null) {
      setTemplateList([{ label: 'Loading...' }]);
    } else if (!templates.native.length) {
      setTemplateList(extractTemplates(templates.custom));
    } else if (!templates.custom.length) {
      setTemplateList(extractTemplates(templates.native));
    } else {
      setTemplateList([
        {
          label: 'Freeform Templates',
          children: extractTemplates(templates.native),
        },
        {
          label: 'Custom Templates',
          children: extractTemplates(templates.custom),
        },
      ]);
    }
  }, [templates]);

  return [defaultTemplate, templateList];
};
