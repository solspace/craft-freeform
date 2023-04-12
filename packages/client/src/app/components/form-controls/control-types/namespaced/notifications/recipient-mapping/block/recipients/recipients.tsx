import React from 'react';
import type { Recipient } from '@ff-client/types/notifications';

import { RecipientsController } from '../../../recipients/recipients.controller';

import { RecipientsWrapper } from './recipients.styles';

type Props = {
  recipients: Recipient[];
  onChange: (value: Recipient[]) => void;
};

export const Recipients: React.FC<Props> = ({ recipients, onChange }) => {
  return (
    <RecipientsWrapper>
      <RecipientsController value={recipients} onChange={onChange} />
    </RecipientsWrapper>
  );
};
