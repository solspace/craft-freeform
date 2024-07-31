import React from 'react';
import { Field } from '@components/layout/blocks/field';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import type { FormImportData, ImportStrategy } from '../../import/import.types';
import type { StrategyCollection } from '../../import/import.types';

type Props = {
  disabled: boolean;
  data: FormImportData;
  strategy: StrategyCollection;
  onUpdate: (strategy: StrategyCollection) => void;
};

export const Strategy: React.FC<Props> = ({
  data,
  strategy,
  disabled,
  onUpdate,
}) => {
  return (
    <div>
      <Field
        label={translate('Existing Form Behavior')}
        instructions={translate(
          'Choose the behavior Freeform should use if this site contains any forms that match the data in this import.'
        )}
        className={classes(
          disabled && 'disabled',
          !data.forms.length && 'hidden'
        )}
      >
        <div className="select">
          <select
            value={strategy.forms}
            onChange={(event) =>
              onUpdate({
                ...strategy,
                forms: event.target.value as ImportStrategy,
              })
            }
          >
            <option value="replace">{translate('Replace')}</option>
            <option value="skip">{translate('Skip')}</option>
          </select>
        </div>
      </Field>

      <Field
        label={translate('Existing Notification Template Behavior')}
        instructions={translate(
          'Choose the behavior Freeform should use if this site contains any email notification templates that match the data in this import.'
        )}
        className={classes(
          disabled && 'disabled',
          !data.notificationTemplates.length && 'hidden'
        )}
      >
        <div className="select">
          <select
            value={strategy.notifications}
            onChange={(event) =>
              onUpdate({
                ...strategy,
                notifications: event.target.value as ImportStrategy,
              })
            }
          >
            <option value="replace">{translate('Replace')}</option>
            <option value="skip">{translate('Skip')}</option>
          </select>
        </div>
      </Field>
    </div>
  );
};
