import React from 'react';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { ExportOptions } from '../../export/export.types';
import type { FormImportData } from '../../import/import.types';

import { PreviewForms } from './forms/forms';
import { PreviewIntegrations } from './integrations/integrations';
import { PreviewNotificationTemplates } from './notification-templates/notification-templates';
import { PreviewSettings } from './settings/settings';
import { PreviewSubmissionsTemplates } from './submissions/submissions';
import { FileList, PreviewWrapper, SelectAll } from './preview.styles';

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
  const isAllSelected =
    options.forms.length === data.forms.length &&
    options.integrations.length === data.integrations.length &&
    options.notificationTemplates.length ===
      data.notificationTemplates.length &&
    options.formSubmissions.length === data.formSubmissions.length &&
    options.settings;

  const emptyOptions: ExportOptions = {
    forms: [],
    notificationTemplates: [],
    integrations: [],
    formSubmissions: [],
    settings: false,
  };

  const filledOptions: ExportOptions = {
    forms: data.forms.map((form) => form.uid),
    notificationTemplates: data.notificationTemplates.map(
      (template) => template.originalId
    ),
    integrations: data.integrations.map((integration) => integration.uid),
    formSubmissions: data.formSubmissions.map(
      (submission) => submission.formUid
    ),
    settings: true,
  };

  return (
    <PreviewWrapper className={classes(disabled && 'disabled')}>
      <FileList>
        <SelectAll
          onClick={() => {
            onUpdate(isAllSelected ? emptyOptions : filledOptions);
          }}
        >
          {translate(isAllSelected ? 'Deselect All' : 'Select All')}
        </SelectAll>

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

          <PreviewIntegrations
            integrations={data.integrations}
            options={options.integrations}
            onUpdate={(integrations) => onUpdate({ ...options, integrations })}
          />

          <PreviewSubmissionsTemplates
            submissions={data.formSubmissions}
            forms={data.forms}
            options={options.formSubmissions}
            onUpdate={(formSubmissions) =>
              onUpdate({ ...options, formSubmissions })
            }
          />

          <PreviewSettings
            value={options.settings}
            onUpdate={(settings) => onUpdate({ ...options, settings })}
          />
        </ul>
      </FileList>
    </PreviewWrapper>
  );
};
