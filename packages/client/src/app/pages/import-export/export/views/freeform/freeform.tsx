import React, { useEffect, useState } from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import String from '@components/form-controls/control-types/string/string';
import { ContentContainer } from '@components/layout/blocks/content-container';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { Preview } from '@ff-client/app/pages/import-export/common/preview/preview';
import { Progress } from '@ff-client/app/pages/import-export/common/progress/progress';
import { useProgressEvent } from '@ff-client/app/pages/import-export/common/progress/progress.hooks';
import { PropertyType } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import { downloadFile } from '@ff-client/utils/files';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import type { ExportOptions } from '../../export.types';

import { useFormsDataQuery, useFormsExportMutation } from './freeform.queries';

export const ExportFreeform: React.FC = () => {
  const progressEvent = useProgressEvent();
  const {
    attachListener,
    triggerProgress,
    clearProgress,
    progress: { active: progressActive },
  } = progressEvent;

  const { data, isFetching } = useFormsDataQuery();
  const { mutate, isLoading } = useFormsExportMutation({
    onSuccess: (res) => {
      const token = res.data.token;
      triggerProgress(generateUrl(`/api/export?token=${token}`));
    },
  });

  const [active] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    forms: [],
    formSubmissions: [],
    notificationTemplates: [],
    integrations: [],
    settings: false,
    password: '',
  });

  useEffect(() => {
    attachListener('file-token', async (event) => {
      const token = event.data;
      const url = generateUrl(`/api/export/download?token=${token}`);

      const res = await axios.get(url, { responseType: 'blob' });

      const time = new Date()
        .toISOString()
        .replace(/[-:]/g, '')
        .replace('T', '-')
        .slice(0, -5);

      const name = `freeform-export-${time}.zip`;

      downloadFile(res.data, name);
    });
  }, []);

  useEffect(() => {
    if (data) {
      setOptions((prev) => ({
        ...prev,
        forms: data.forms.map((form) => form.uid),
        notificationTemplates: data.notificationTemplates.map(
          (template) => template.originalId
        ),
      }));
    }
  }, [data]);

  const onClick = (): void => {
    clearProgress();
    mutate(options);
  };

  const isCurrentlyActive = isFetching || active || progressActive || isLoading;

  if (isFetching) {
    return <ContentContainer>{translate('Loading')}</ContentContainer>;
  }

  return (
    <ContentContainer>
      <Breadcrumb id="export" label="Export" url="export/forms" />
      <Breadcrumb id="export-forms" label="Forms" url="export/forms" />

      {data && (
        <div className="field">
          <div className="heading">
            <label htmlFor="">{translate('Select Data')}</label>
          </div>
          <div className="input">
            <Preview
              disabled={false}
              data={data}
              options={options}
              onUpdate={(options) => setOptions(options)}
            />
          </div>
        </div>
      )}

      <String
        value={options.password || ''}
        updateValue={(password) => setOptions({ ...options, password })}
        property={{
          handle: 'password',
          label: 'Password Protect exported file',
          instructions:
            'Enter a password if you wish to password protect your zip file.',
          type: PropertyType.String,
          placeholder: 'Enter a password',
        }}
      />

      <div className="field">
        <button
          className={classes(
            'btn',
            'submit',
            isCurrentlyActive && 'disabled',
            !options.forms.length &&
              !options.notificationTemplates.length &&
              !options.integrations.length &&
              !options.formSubmissions.length &&
              'disabled'
          )}
          disabled={isCurrentlyActive}
          onClick={onClick}
        >
          <LoadingText
            loadingText={translate('Exporting')}
            loading={isCurrentlyActive}
            spinner
          >
            {translate('Begin Export')}
          </LoadingText>
        </button>
      </div>

      <Progress
        label={translate('Export Progress')}
        finishLabel={translate('Export completed successfully')}
        event={progressEvent}
      />
    </ContentContainer>
  );
};
