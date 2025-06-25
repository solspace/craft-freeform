import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import type { OptionCollection } from '@ff-client/types/properties';

import { useNotificationTemplates } from '../../../notification-template/notification-template.hooks';

import { TemplatesWrapper } from './template.styles';

type Props = {
  id: string | number;
  onChange: (id: string | number) => void;
};

export const Template: React.FC<Props> = ({ id, onChange }) => {
  const { templates, isFetching, selectedTemplate } =
    useNotificationTemplates(id);

  if (isFetching) {
    return <TemplatesWrapper>loading...</TemplatesWrapper>;
  }

  const options: OptionCollection = [];

  if (templates?.form) {
    options.push({
      label: 'Form',
      icon: <i className="fa-regular fa-clipboard-list-check"></i>,
      children: templates.form.map((template) => ({
        label: template.name,
        value: template.id as string,
      })),
    });
  }

  if (templates?.global) {
    options.push({
      label: 'Global',
      icon: <i className="fa-solid fa-earth-americas" />,
      children: templates.global.map((template) => ({
        label: template.name,
        value: template.id as string,
      })),
    });
  }

  return (
    <TemplatesWrapper>
      <Dropdown
        value={selectedTemplate?.id as string}
        options={options}
        emptyOption={'Use default template'}
        onChange={(selectedValue) => {
          if (/^[0-9]+$/.test(selectedValue)) {
            onChange(Number(selectedValue));
          }

          onChange(selectedValue);
        }}
      />
    </TemplatesWrapper>
  );
};
