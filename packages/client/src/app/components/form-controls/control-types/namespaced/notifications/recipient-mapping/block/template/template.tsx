import React from 'react';
import { Dropdown } from '@components/elements/custom-dropdown/dropdown';
import type { OptionCollection } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';

import FilesIcon from '../../../notification-template/icons/files.svg';
import DatabaseIcon from '../../../notification-template/icons/files.svg';
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

  if (templates?.database) {
    options.push({
      label: 'Database',
      icon: <DatabaseIcon />,
      children: templates.database.map((template) => ({
        label: template.name,
        value: template.id as string,
      })),
    });
  }

  if (templates?.files) {
    options.push({
      label: 'Files',
      icon: <FilesIcon />,
      children: templates.files.map((template) => ({
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
        emptyOption={translate('Use default template')}
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
