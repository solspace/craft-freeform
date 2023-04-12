import React, { useEffect } from 'react';
import { HelpText } from '@components/elements/help-text';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { Recipient } from '@ff-client/types/notifications';
import translate from '@ff-client/utils/translations';

import { RecipientsController } from './recipients.controller';
import { cleanupRecipients } from './recipients.operations';

const Recipients: React.FC<ControlType<Recipient[]>> = ({
  value = [],
  property,
  errors,
  updateValue,
}) => {
  useEffect(() => {
    return () => {
      updateValue(cleanupRecipients(value));
    };
  }, []);

  return (
    <Control property={property} errors={errors}>
      <RecipientsController value={value} onChange={updateValue} />
      <HelpText>
        <span
          dangerouslySetInnerHTML={{
            __html: translate(
              'Press <b>enter</b> while focusing an input to add a new set of inputs.'
            ),
          }}
        />
      </HelpText>
    </Control>
  );
};

export default Recipients;
