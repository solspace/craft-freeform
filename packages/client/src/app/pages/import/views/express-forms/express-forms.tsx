import React, { useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import { Done, DoneWrapper, ProgressWrapper } from '../../import.styles';
import type { ImportOptions, ImportStrategy } from '../../import.types';
import { Preview } from '../../preview/preview';
import { Progress } from '../../progress/progress';
import {
  useDoneAnimation,
  useProgressAnimation,
} from '../../progress/progress.animations';

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
  });

  const [active, setActive] = useState(false);
  const [displayProgress, setDisplayProgress] = useState(false);
  const [showDone, setShowDone] = useState(false);

  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [total, setTotal] = useState<[number, number]>([0, 0]);
  const [info, setInfo] = useState<string>();
  const [errors, setErrors] = useState<string[]>([]);

  const { data, isFetching } = useExpressFormsDataQuery();
  const progressAnimation = useProgressAnimation(displayProgress);
  const doneAnimation = useDoneAnimation(showDone);

  const onClick = async (): Promise<void> => {
    setProgress([0, 0]);
    setTotal([0, 0]);

    setActive(true);
    setInfo(undefined);

    const { data } = await axios.post('/api/import/prepare', {
      exporter:
        '\\Solspace\\Freeform\\Bundles\\Backup\\Export\\ExpressFormsExporter',
      options,
    });

    const url = generateUrl(`/api/import?token=${data.token}`);
    const source = new EventSource(url);

    source.onopen = () => {
      setDisplayProgress(true);
    };

    source.onerror = () => {
      console.error('An error occurred during import');
      source.close();
      setActive(false);
      setDisplayProgress(false);
    };

    source.addEventListener('progress', (event) => {
      const progress = parseInt(event.data);
      setProgress((prev) => [prev[0] + progress, prev[1] + progress]);
    });

    source.addEventListener('total', (event) => {
      setTotal([parseInt(event.data), 0]);
      setErrors([]);
    });

    source.addEventListener('info', (event) => {
      setInfo(event.data);
    });

    source.addEventListener('err', (event) => {
      setErrors((prev) => [...prev, JSON.parse(event.data)]);
    });

    source.addEventListener('reset', (event) => {
      setTotal((prev) => [prev[0], parseInt(event.data)]);
      setProgress((prev) => [prev[0], 0]);
    });

    source.addEventListener('exit', () => {
      source.close();
      setDisplayProgress(false);
      setActive(false);
      setShowDone(true);
      setTimeout(() => {
        setShowDone(false);
      }, 5000);
    });
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
                onUpdate={(options) => setOptions(options)}
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
