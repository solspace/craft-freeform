import type { ChangeEventHandler } from 'react';
import React, { useState } from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { Instructions, Label } from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import { ContentContainer } from '@components/layout/blocks/content-container';
import { Field } from '@components/layout/blocks/field';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import { Preview } from '../../common/preview/preview';
import { Progress } from '../../common/progress/progress';
import { useProgressEvent } from '../../common/progress/progress.hooks';
import { Strategy } from '../../common/strategy/strategy';
import type {
  FormImportData,
  ImportOptions,
  StrategyCollection,
} from '../import.types';

import { FileInput, FileWrapper } from './freeform-data.styles';
import type { AvailableOptionResponse } from './freeform-data.types';

export const ImportFreeformData: React.FC = () => {
  const [fileToken, setFileToken] = useState<string>();
  const [availableOptions, setAvailableOptions] = useState<FormImportData>();
  const [errors, setErrors] = useState<string[]>();
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

  const onChange: ChangeEventHandler<HTMLInputElement> = async (event) => {
    setErrors(undefined);
    setFileToken(undefined);
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post<AvailableOptionResponse>(
        '/api/import/file',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setAvailableOptions(data.options);
      setFileToken(data.token);

      if (data.options) {
        setOptions((prev) => ({
          ...prev,
          forms: data.options.forms.map((form) => form.uid),
          notificationTemplates: data.options.notificationTemplates.map(
            (template) => template.originalId
          ),
          integrations: data.options.integrations.map(
            (integration) => integration.uid
          ),
          formSubmissions: data.options.formSubmissions.map(
            (submission) => submission.form.uid
          ),
          settings: true,
        }));
      }
    } catch (error) {
      setErrors(error?.errors?.import?.file);
      console.error('Failed to upload file', error);
    }
  };

  const onImport = async (): Promise<void> => {
    if (!fileToken) {
      return;
    }

    progressEvent.clearProgress();

    const { data } = await axios.post('/api/import/prepare', {
      exporter:
        '\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FileExportReader',
      options: {
        ...options,
        fileToken,
      },
    });

    const url = generateUrl(`/api/import?token=${data.token}`);
    progressEvent.triggerProgress(url);
  };

  return (
    <ContentContainer>
      <Breadcrumb id="import" label="Import" url="import/forms" />
      <Breadcrumb id="import-forms" label="Forms" url="import/forms" />

      <FileWrapper>
        <Label>{translate('Upload file')}</Label>
        <FileInput type="file" onChange={onChange} accept=".zip" />
        <Instructions>
          {translate('Accepts `.zip` files. Only upload files that you trust.')}
        </Instructions>
        <FormErrorList errors={errors} />
      </FileWrapper>

      {availableOptions && (
        <>
          <Field
            label={translate('Select Data')}
            instructions={translate('Select which data you wish to import.')}
          >
            <Preview
              disabled={false}
              data={availableOptions}
              options={options}
              onUpdate={(opts) => setOptions({ ...options, ...opts })}
            />
          </Field>

          <Strategy
            data={availableOptions}
            strategy={options.strategy}
            disabled={false}
            onUpdate={(strategy: StrategyCollection) =>
              setOptions((prev) => ({
                ...prev,
                strategy,
              }))
            }
          />

          <Field>
            <button className="btn submit" type="button" onClick={onImport}>
              <LoadingText
                loadingText={translate('Processing')}
                loading={false}
                spinner
              >
                {translate('Begin Import')}
              </LoadingText>
            </button>
          </Field>

          <Progress
            label={translate('Import')}
            finishLabel={translate('Import completed successfully')}
            event={progressEvent}
          />
        </>
      )}
    </ContentContainer>
  );
};
