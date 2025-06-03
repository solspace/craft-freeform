import type { FC } from 'react';
import type { ControlProps } from '@components/form-controls/control.block';
import { handle } from '@components/middleware/implementations';
import type { Wrapper } from '@ff-client/types/notifications';
import type {
  GenericValue,
  OptionCollection,
} from '@ff-client/types/properties';
import transliterate from '@sindresorhus/transliterate';
import axios from 'axios';
import { camelCase } from 'lodash';

import { AssetsInput } from './inputs/assets';
import { BooleanInput } from './inputs/boolean';
import { DropdownInput } from './inputs/dropdown';
import { HtmlBodyInput } from './inputs/html-body/html-body';
import { TextInput } from './inputs/text';

export type InputControl = ControlProps & {
  type: FC<ControlProps>;
  multiline?: boolean;
  value?: GenericValue;
  emptyOption?: string;
  optionDefinition?: OptionCollection | (() => Promise<OptionCollection>);
  onChange?: (value: GenericValue) => void;
  updateState?: (value: GenericValue, state: GenericValue) => GenericValue;
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
          updateState: (value: string, state: GenericValue) => {
            return {
              ...state,
              handle: handle(camelCase(transliterate(value))),
            };
          },
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
          handle: 'body',
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
      [
        {
          type: BooleanInput,
          label: 'Include Attachments',
          handle: 'includeAttachments',
          instructions:
            'Whether or not to include attachments in the email notification.',
        },
      ],
      [
        {
          type: AssetsInput,
          label: 'Predefined Assets',
          handle: 'presetAssets',
          instructions:
            'The assets that will be included in the email notification. This is a list of asset IDs. You can use the asset picker to select them.',
        },
      ],
    ],
  },
  {
    name: 'Templates',
    rows: [
      [
        {
          type: DropdownInput,
          label: 'Template Wrapper',
          handle: 'wrapperId',
          instructions: `The template wrapper for the email notification. This is the HTML that wraps around the body of the email.`,
          emptyOption: 'No Wrapper',
          optionDefinition: async () => {
            const wrappers = await axios.get<Wrapper[]>(
              '/api/templates/wrappers'
            );

            return wrappers.data.map((wrapper) => ({
              label: wrapper.name,
              value: String(wrapper.id),
            }));
          },
        },
      ],
      [
        {
          type: DropdownInput,
          label: 'PDF Template',
          handle: 'pdfTemplate',
          instructions: `Pick a PDF template to use for this notification. This will be used when the notification is sent as a PDF.`,
        },
      ],
    ],
  },
] as const satisfies FieldConfiguration;

type FieldHandles =
  (typeof configuration)[number]['rows'][number][number]['handle'];

export type NotificationTabs = (typeof configuration)[number]['name'];
export type NotificationConfiguration = Partial<
  Record<FieldHandles, GenericValue>
>;
