import React, { useEffect, useState } from 'react';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { Preview } from '@ff-client/app/pages/import/preview/preview';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { ExportOptions } from '../../export.types';

import { useFormsDataQuery, useFormsExportMutation } from './freeform.queries';

export const ExportFreeform: React.FC = () => {
  const { data, isFetching } = useFormsDataQuery();
  const { mutate, isLoading } = useFormsExportMutation();

  const [active] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    forms: [],
    formSubmissions: [],
    notificationTemplates: [],
    integrations: [],
  });

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
    mutate(options);
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
            loadingText={translate('Exporting')}
            loading={isLoading}
            spinner
          >
            {translate('Begin Export')}
          </LoadingText>
        </button>
      </div>
    </div>
  );
};
