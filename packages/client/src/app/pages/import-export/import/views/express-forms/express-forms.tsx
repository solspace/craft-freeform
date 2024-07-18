import React, { useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import { Preview } from '../../../common/preview/preview';
import { Progress } from '../../../common/progress/progress';
import {
  useDoneAnimation,
  useProgressAnimation,
} from '../../../common/progress/progress.animations';
import { useProgressEvent } from '../../../common/progress/progress.hooks';
import { Done, DoneWrapper, ProgressWrapper } from '../../import.styles';
import type { ImportOptions, ImportStrategy } from '../../import.types';

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

  const {
    triggerProgress,
    clearProgress,
    progress: {
      active,
      displayProgress,
      errors,
      info,
      progress,
      showDone,
      total,
    },
  } = useProgressEvent();

  const { data, isFetching } = useExpressFormsDataQuery();
  const progressAnimation = useProgressAnimation(displayProgress);
  const doneAnimation = useDoneAnimation(showDone);

  const onClick = async (): Promise<void> => {
    clearProgress();

    const { data } = await axios.post('/api/import/prepare', {
      exporter:
        '\\Solspace\\Freeform\\Bundles\\Backup\\Export\\ExpressFormsExporter',
      options,
    });

    const url = generateUrl(`/api/import?token=${data.token}`);
    triggerProgress(url);
  };

  if (isFetching) {
    return (
      <div id="content-container">
        <div id="content" className="content-pane">
          {translate('Loading')}
        </div>
      </div>
    );
  }

  if (
    !data.forms.length &&
    !data.notificationTemplates.length &&
    !data.formSubmissions.length
  ) {
    return (
      <div id="content-container">
        <div id="content" className="content-pane">
          {translate('No data found')}
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
                disabled={active}
                data={data}
                options={options}
                onUpdate={(opts) => setOptions({ ...options, ...opts })}
              />
            </div>
          </div>
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

        <ProgressWrapper style={progressAnimation}>
          <Progress
            width="60%"
            show
            value={progress[0]}
            max={total[0]}
            active={true}
          >
            {translate('Import Progress')}
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
