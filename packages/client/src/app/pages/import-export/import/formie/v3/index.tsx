import React, { useState } from 'react';
import { Breadcrumb } from '@components/breadcrumbs/breadcrumbs';
import { ContentContainer } from '@components/layout/blocks/content-container';
import { Field } from '@components/layout/blocks/field';
import { LoadingText } from '@components/loaders/loading-text/loading-text';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';
import { generateUrl } from '@ff-client/utils/urls';
import axios from 'axios';

import { Preview } from '../../../common/preview/preview';
import { Progress } from '../../../common/progress/progress';
import { useProgressEvent } from '../../../common/progress/progress.hooks';
import { Strategy } from '../../../common/strategy/strategy';
import { isAllOptionsEmpty } from '../../../export/export.operations';
import type { ImportOptions } from '../../import.types';
import type { StrategyCollection } from '../../import.types';
import { createImportOptions } from '../../import.types';

import { useFormieDataQuery } from './fomie.queries';

export const ImportFormie: React.FC = () => {
  const [options, setOptions] = useState<ImportOptions>(createImportOptions());

  const progressEvent = useProgressEvent();
  const active = progressEvent.progress.active;

  const { data, isFetching } = useFormieDataQuery();

  const onClick = async (): Promise<void> => {
    progressEvent.clearProgress();

    const { data } = await axios.post('/api/import/prepare', {
      exporter:
        '\\Solspace\\Freeform\\Bundles\\Backup\\Export\\FormieV3Exporter',
      options,
    });

    const url = generateUrl(`/api/import?token=${data.token}`);
    progressEvent.triggerProgress(url);
  };

  if (isFetching) {
    return <ContentContainer>{translate('Loading...')}</ContentContainer>;
  }

  if (!data) {
    return <ContentContainer>{translate('No data found')}</ContentContainer>;
  }

  if (
    !data.forms.length &&
    !data.templates.pdf.length &&
    !data.templates.notification.length &&
    !data.templates.formatting.length &&
    !data.templates.success.length &&
    !data.formSubmissions.length
  ) {
    return <ContentContainer>{translate('No data found')}</ContentContainer>;
  }

  return (
    <ContentContainer>
      <Breadcrumb id="import" label="Import" url="import/formie3" />
      <Breadcrumb id="import-formie3" label="Formie v3" url="import/formie3" />
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

      <Strategy
        data={data}
        strategy={options.strategy}
        disabled={active}
        onUpdate={(strategy: StrategyCollection) =>
          setOptions((prev) => ({
            ...prev,
            strategy,
          }))
        }
      />

      <button
        className={classes(
          'field btn',
          'submit',
          active && 'disabled',
          isAllOptionsEmpty(options) && 'disabled'
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
