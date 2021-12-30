import { SelectOption } from '@ff-app/shared/Forms/Select/Select';
import { useContext } from 'react';
import { FormOptionsContext } from '../context/form-types-context';
import { FormTemplate } from '../types/forms';

const mapper = ({ name, id }: FormTemplate): SelectOption => ({ label: name, value: id });

const extractTemplates = (templates: FormTemplate[]): [string, SelectOption[]] => {
  const nativeTemplates = templates.map(mapper);
  const defaultTemplate = templates.length && templates[0].id;

  return [defaultTemplate, nativeTemplates];
};

export const useFormTemplatesOptions = (): [string, SelectOption[]] => {
  const { templates } = useContext(FormOptionsContext);

  if (templates === null) {
    return ['bootstrap-4.html', [{ label: 'Loading...' }]];
  }

  if (!templates.native) {
    return extractTemplates(templates.custom);
  }

  if (!templates.custom) {
    return extractTemplates(templates.native);
  }

  return [
    'bootstrap-4.html',
    [
      {
        label: 'Solspace Templates',
        children: templates.native.map(mapper),
      },
      {
        label: 'Custom Templates',
        children: templates.custom.map(mapper),
      },
    ],
  ];
};
