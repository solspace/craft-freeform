import type { FC } from 'react';
import type { ControlProps } from '@components/form-controls/control.block';

import { HtmlBodyInput } from './inputs/html-body/html-body';
import { TextInput } from './inputs/text';

export type InputControl = ControlProps & {
  type: FC<ControlProps>;
  multiline?: boolean;
};

type Row = InputControl[];

type Tab = {
  name: string;
  rows: Row[];
};

export type FieldConfiguration = Tab[];

export const configuration = [
  {
    name: 'Content',
    rows: [
      [
        {
          type: TextInput,
          label: 'Name',
          handle: 'name',
          instructions:
            'What this notification template will be called in the CP.',
        },
        {
          type: TextInput,
          label: 'Handle',
          handle: 'handle',
          instructions: 'Unique identifier for the notification',
          required: true,
        },
      ],
      [
        {
          type: TextInput,
          label: 'Description',
          handle: 'description',
          instructions: 'Description of this notification.',
          multiline: true,
        },
      ],
      [
        {
          type: TextInput,
          label: 'Subject',
          handle: 'subject',
          instructions: 'The subject line for the email notification.',
        },
      ],
      [
        {
          type: HtmlBodyInput,
          label: 'Email Body (HTML)',
          handle: 'bodyHtml',
          instructions:
            'The HTML content of the email notification. If you wish to use Text only, leave this empty and fill out the Text body (below). See documentation for availability of variables.',
        },
      ],
    ],
  },
  {
    name: 'Advanced',
    rows: [
      [
        {
          type: TextInput,
          label: 'From Name',
          handle: 'fromName',
          instructions:
            'The name that the email will appear from in your email notification.',
        },
        {
          type: TextInput,
          label: 'Reply-To Name',
          handle: 'replyTo',
          instructions:
            'The reply-to name that the email will appear from in your email notification.',
        },
      ],
      [
        {
          type: TextInput,
          label: 'From Email',
          handle: 'fromEmail',
          instructions:
            'The email address that the email will appear from in your email notification.',
        },
        {
          type: TextInput,
          label: 'Reply-To Email',
          handle: 'replyToEmail',
          instructions: `The reply-to email address for your email notification. Leave blank to use 'From Email' address.`,
        },
      ],
      [
        {
          type: TextInput,
          label: 'CC',
          handle: 'cc',
          instructions: `The email address(es) you would like to be CC'd in the email notification. Separate multiples with commas. Leave blank to not use.`,
        },
        {
          type: TextInput,
          label: 'BCC',
          handle: 'bcc',
          instructions: `The email address(es) you would like to be BCC'd in the email notification. Separate multiples with commas. Leave blank to not use.`,
        },
      ],
    ],
  },
] as const satisfies FieldConfiguration;

type FieldHandles =
  (typeof configuration)[number]['rows'][number][number]['handle'];

export type NotificationTabs = (typeof configuration)[number]['name'];
export type NotificationConfiguration = Partial<Record<FieldHandles, string>>;
