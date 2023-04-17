import React from 'react';

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

  return (
    <TemplatesWrapper className="select">
      <select
        className="select fullwidth"
        value={selectedTemplate?.id}
        onChange={(event) => {
          let newValue: string | number = event.target.value;
          if (/^[0-9]+$/.test(newValue)) {
            newValue = Number(newValue);
          }

          onChange(newValue);
        }}
      >
        <option value="" label="Optional override template" />
        {!templates?.database && !templates?.files && (
          <optgroup label="No templates set up" />
        )}
        {!!templates?.database && (
          <optgroup label="Database">
            {templates.database.map((template) => (
              <option
                key={template.id}
                value={template.id}
                label={template.name}
              />
            ))}
          </optgroup>
        )}
        {!!templates?.files && (
          <optgroup label="Files">
            {templates.files.map((template) => (
              <option
                key={template.id}
                value={template.id}
                label={template.name}
              />
            ))}
          </optgroup>
        )}
      </select>
    </TemplatesWrapper>
  );
};
