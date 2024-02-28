import React, { useState } from 'react';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import type { ImportOptions } from '../../import.types';
import { Preview } from '../../preview/preview';
import { Progress } from '../../progress/progress';

import { useExpressFormsDataQuery } from './express-forms.queries';

export const ImportExpressForms: React.FC = () => {
  const [options, setOptions] = useState<ImportOptions>({
    forms: [],
    notificationTemplates: [],
    integrations: [],
  });

  const [active, setActive] = useState(false);
  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [total, setTotal] = useState<[number, number]>([0, 0]);
  const [info, setInfo] = useState<string>();

  const { data } = useExpressFormsDataQuery();

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
    source.addEventListener('progress', () => {
      setProgress((prev) => [prev[0] + 1, prev[1] + 1]);
    });

    source.addEventListener('total', (event) => {
      setTotal([parseInt(event.data), 0]);
    });

    source.addEventListener('info', (event) => {
      setInfo(event.data);
    });

    source.addEventListener('reset', (event) => {
      setTotal((prev) => [prev[0], parseInt(event.data)]);
      setProgress((prev) => [prev[0], 0]);
    });

    source.addEventListener('exit', () => {
      source.close();
      setActive(false);
    });
  };

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
                data={data}
                options={options}
                onUpdate={(options) => setOptions(options)}
              />
            </div>
          </div>
        )}
        <div className="field">
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
              <select>
                <option value="replace">Replace</option>
                <option value="skip">Skip</option>
              </select>
            </div>
          </div>
        </div>
        <div className="field">
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
              <select>
                <option value="replace">Replace</option>
                <option value="skip">Skip</option>
              </select>
            </div>
          </div>
        </div>
        <button className="btn submit" onClick={onClick}>
          {translate('Begin Import')}
        </button>
        <Progress
          width="60%"
          show
          value={progress[0]}
          max={total[0]}
          active={active}
        />

        <Progress
          width="60%"
          show
          value={progress[1]}
          max={total[1]}
          active={active}
        >
          {info}
        </Progress>
      </div>
    </div>
  );
};
