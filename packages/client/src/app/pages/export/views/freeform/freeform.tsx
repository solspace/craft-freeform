import React, { useEffect, useState } from 'react';
import String from '@components/form-controls/control-types/string/string';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { Preview } from '@ff-client/app/pages/import/preview/preview';
import { Progress } from '@ff-client/app/pages/import/progress/progress';
import {
  useDoneAnimation,
  useProgressAnimation,
} from '@ff-client/app/pages/import/progress/progress.animations';
import { useProgressEvent } from '@ff-client/app/pages/import/progress/progress.hooks';
import { PropertyType } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';
import { downloadFile } from '@ff-client/utils/files';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import { Done, DoneWrapper, ProgressWrapper } from '../../export.styles';
import type { ExportOptions } from '../../export.types';

import { useFormsDataQuery, useFormsExportMutation } from './freeform.queries';

export const ExportFreeform: React.FC = () => {
  const {
    attachListener,
    triggerProgress,
    clearProgress,
    progress: {
      active: progressActive,
      showDone,
      displayProgress,
      errors,
      info,
      progress,
      total,
    },
  } = useProgressEvent();

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

  const progressAnimation = useProgressAnimation(displayProgress);
  const doneAnimation = useDoneAnimation(showDone);

  const isCurrentlyActive = isFetching || active || progressActive || isLoading;

  if (isFetching) {
    return (
      <div id="content-container">
        <div id="content" className="content-pane">
          {translate('Loading')}
        </div>
      </div>
    );
  }

  return (
    <div id="content-container">
      <div id="content" className="content-pane">
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

        <ProgressWrapper style={progressAnimation}>
          <Progress
            width="60%"
            show
            value={progress[0]}
            max={total[0]}
            active={true}
          >
            {translate('Export Progress')}
          </Progress>

          <Progress
            width="60%"
            show
            variant="secondary"
            value={progress[1]}
            max={total[1]}
            active={true}
          >
            {info}
          </Progress>
        </ProgressWrapper>

        {errors.length > 0 && (
          <ul className="errors">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        <DoneWrapper style={doneAnimation}>
          <Done>
            <i className="fa-sharp fa-solid fa-check" />
            <span>{translate('Import completed successfully!')}</span>
          </Done>
        </DoneWrapper>
      </div>
    </div>
  );
};
