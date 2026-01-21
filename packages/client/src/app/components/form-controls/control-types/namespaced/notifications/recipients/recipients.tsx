import React from 'react';
import { HelpText } from '@components/elements/help-text';
import { Control } from '@components/form-controls/control';
import type { ControlType } from '@components/form-controls/types';
import type { RecipientsProperty } from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import { sanitize } from 'dompurify';

import { RecipientsController } from './recipients.controller';

const Recipients: React.FC<ControlType<RecipientsProperty>> = ({
  value = [],
  property,
  errors,
  updateValue,
  context,
}) => {
  return (
    <Control property={property} errors={errors} context={context}>
      <RecipientsController value={value} onChange={updateValue} />
      <HelpText>
        <span
          dangerouslySetInnerHTML={{
            __html: sanitize(
              translate(
                'Press <b>enter</b> while focusing an input to add a new set of inputs.'
              )
            ),
          }}
        />
      </HelpText>
    </Control>
  );
};

export default Recipients;
