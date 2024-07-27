import React, { useState } from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { ContentContainer } from '@components/layout/blocks/content-container';
import { Field } from '@components/layout/blocks/field';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import { Preview } from '../../common/preview/preview';
import { Progress } from '../../common/progress/progress';
import { useProgressEvent } from '../../common/progress/progress.hooks';
import type { ImportOptions, ImportStrategy } from '../import.types';

import { useExpressFormsDataQuery } from './express-forms.queries';

export const ImportExpressForms: React.FC = () => {
  const [options, setOptions] = useState<ImportOptions>({
    forms: [],
    formSubmissions: [],
    notificationTemplates: [],
    integrations: [],
    strategy: {
      forms: 'skip',
      notifications: 'skip',
    },
    settings: false,
  });

  const progressEvent = useProgressEvent();
  const active = progressEvent.progress.active;

  const { data, isFetching } = useExpressFormsDataQuery();

  const onClick = async (): Promise<void> => {
    progressEvent.clearProgress();

    const { data } = await axios.post('/api/import/prepare', {
      exporter:
        '\\Solspace\\Freeform\\Bundles\\Backup\\Export\\ExpressFormsExporter',
      options,
    });

    const url = generateUrl(`/api/import?token=${data.token}`);
    progressEvent.triggerProgress(url);
  };

  if (isFetching) {
    return <ContentContainer>{translate('Loading')}</ContentContainer>;
  }

  if (
    !data.forms.length &&
    !data.notificationTemplates.length &&
    !data.formSubmissions.length
  ) {
    return <ContentContainer>{translate('No data found')}</ContentContainer>;
  }

  return (
    <ContentContainer>
      <Breadcrumb id="import" label="Import" url="import/express-forms" />
      <Breadcrumb
        id="import-express"
        label="Express Forms"
        url="import/express-forms"
      />
      {data && (
        <Field label={translate('Select Data')}>
          <Preview
            disabled={active}
            data={data}
            options={options}
            onUpdate={(opts) => setOptions({ ...options, ...opts })}
          />
        </Field>
      )}

      <div
        className={classes(
          'field',
          active && 'disabled',
          !data.forms.length && 'hidden'
        )}
      >
        <div className="heading">
          <label htmlFor="test">{translate('Existing Form Behavior')}</label>
        </div>
        <div className="instructions">
          {translate(
            'Choose the behavior Freeform should use if this site contains any forms that match the data in this import.'
          )}
        </div>
        <div className="input">
          <div className="select">
            <select
              value={options.strategy.forms}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  strategy: {
                    ...prev.strategy,
                    forms: event.target.value as ImportStrategy,
                  },
                }))
              }
            >
              <option value="replace">{translate('Replace')}</option>
              <option value="skip">{translate('Skip')}</option>
            </select>
          </div>
        </div>
      </div>

      <div
        className={classes(
          'field',
          active && 'disabled',
          !data.notificationTemplates.length && 'hidden'
        )}
      >
        <div className="heading">
          <label htmlFor="test">
            {translate('Existing Notification Template Behavior')}
          </label>
        </div>
        <div className="instructions">
          {translate(
            'Choose the behavior Freeform should use if this site contains any email notification templates that match the data in this import.'
          )}
        </div>
        <div className="input">
          <div className="select">
            <select
              value={options.strategy.notifications}
              onChange={(event) =>
                setOptions((prev) => ({
                  ...prev,
                  strategy: {
                    ...prev.strategy,
                    notifications: event.target.value as ImportStrategy,
                  },
                }))
              }
            >
              <option value="replace">{translate('Replace')}</option>
              <option value="skip">{translate('Skip')}</option>
            </select>
          </div>
        </div>
      </div>

      <button
        className={classes(
          'btn',
          'submit',
          active && 'disabled',
          !options.forms.length &&
            !options.notificationTemplates.length &&
            !options.formSubmissions.length &&
            'disabled'
        )}
        disabled={active}
        onClick={onClick}
      >
        <LoadingText
          loadingText={translate('Processing')}
          loading={active}
          spinner
        >
          {translate('Begin Import')}
        </LoadingText>
      </button>

      <Progress
        label={translate('Import')}
        finishLabel={translate('Import completed successfully')}
        event={progressEvent}
      />
    </ContentContainer>
  );
};
