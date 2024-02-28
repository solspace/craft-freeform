import React from 'react';

import type { FormImportData, ImportOptions } from '../import.types';

import { PreviewForms } from './forms/forms';
import { PreviewNotificationTemplates } from './notification-templates/notification-templates';
import { FileList, PreviewWrapper } from './preview.styles';

type Props = {
  data?: FormImportData;
  options: ImportOptions;
  onUpdate: (options: ImportOptions) => void;
};

export const Preview: React.FC<Props> = ({ data, options, onUpdate }) => {
  return (
    <PreviewWrapper>
      <FileList>
        <ul>
          <PreviewForms
            forms={data.forms}
            options={options.forms}
            onUpdate={(forms) => onUpdate({ ...options, forms })}
          />

          <PreviewNotificationTemplates
            templates={data.notificationTemplates}
            options={options.notificationTemplates}
            onUpdate={(notificationTemplates) =>
              onUpdate({ ...options, notificationTemplates })
            }
          />
        </ul>
      </FileList>
    </PreviewWrapper>
  );
};
