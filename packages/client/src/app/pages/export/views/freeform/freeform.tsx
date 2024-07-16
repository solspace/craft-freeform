import React, { useEffect, useState } from 'react';
import String from '@components/form-controls/control-types/string/string';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import { Preview } from '@ff-client/app/pages/import/preview/preview';
import { PropertyType } from '@ff-client/types/properties';
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
    settings: false,
    password: '',
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

        <button
          className={classes(
            'btn',
            'submit',
            active && 'disabled',
            !options.forms.length &&
              !options.notificationTemplates.length &&
              !options.integrations.length &&
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
