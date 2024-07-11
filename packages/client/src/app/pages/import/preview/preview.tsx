import React from 'react';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { ExportOptions } from '../../export/export.types';
import type { FormImportData } from '../import.types';

import { PreviewForms } from './forms/forms';
import { PreviewNotificationTemplates } from './notification-templates/notification-templates';
import { PreviewSubmissionsTemplates } from './submissions/submissions';
import { FileList, PreviewWrapper } from './preview.styles';

type Props = {
  data?: FormImportData;
  options: ExportOptions;
  disabled?: boolean;
  onUpdate: (options: ExportOptions) => void;
};

export const Preview: React.FC<Props> = ({
  data,
  options,
  disabled,
  onUpdate,
}) => {
  return (
    <PreviewWrapper className={classes(disabled && 'disabled')}>
      <FileList>
        <a
          onClick={() => {
            onUpdate({
              ...options,
              forms: data.forms.map((form) => form.uid),
              notificationTemplates: data.notificationTemplates.map(
                (template) => template.originalId
              ),
              formSubmissions: data.formSubmissions.map(
                (submission) => submission.formUid
              ),
            });
          }}
        >
          {translate('Select All')}
        </a>
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

          <PreviewSubmissionsTemplates
            submissions={data.formSubmissions}
            forms={data.forms}
            options={options.formSubmissions}
            onUpdate={(formSubmissions) =>
              onUpdate({ ...options, formSubmissions })
            }
          />
        </ul>
      </FileList>
    </PreviewWrapper>
  );
};
