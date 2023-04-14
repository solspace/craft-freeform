import type { Recipient } from '@ff-client/types/notifications';

export const addRecipient = (value: Recipient[]): Recipient[] => {
  return [...(value || []), { email: '', name: '' }];
};

export const removeRecipient = (
  value: Recipient[],
  index: number
): Recipient[] => {
  return value.filter((_, idx) => idx !== index);
};

export const updateRecipient = (
  index: number,
  recipient: Recipient,
  value: Recipient[]
): Recipient[] => {
  const clone = [...value];
  clone[index] = recipient;

  return clone;
};

export const cleanupRecipients = (value: Recipient[]): Recipient[] => {
  return value.filter((recipient) => Boolean(recipient.email));
};
