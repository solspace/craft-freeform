import type { FC } from 'react';
import type { ControlProps } from '@components/form-controls/control.block';
import { handle } from '@components/middleware/implementations';
import { Edition } from '@config/freeform/freeform.config';
import type { Wrapper } from '@ff-client/types/notifications';
import type {
  GenericValue,
  OptionCollection,
} from '@ff-client/types/properties';
import translate from '@ff-client/utils/translations';
import transliterate from '@sindresorhus/transliterate';
import axios from 'axios';
import { camelCase } from 'lodash';

import { AssetsInput } from './inputs/assets';
import { BooleanInput } from './inputs/boolean';
import { CheckboxesInput } from './inputs/checkboxes';
import { DropdownInput } from './inputs/dropdown';
import { HtmlBodyInput } from './inputs/html-body/html-body';
import { TemplatePreview } from './inputs/preview/preview';
import { TextInput } from './inputs/text';
import { TextTokens } from './inputs/text-tokens/text-tokens';
import type { PushState } from './template.modal';

export type InputControl = ControlProps & {
  type: FC<ControlProps>;
  multiline?: boolean;
  value?: GenericValue;
  emptyOption?: string;
  inView?: boolean;
  minEdition?: Edition;
  context?: PushState;
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
    name: translate('Content'),
    rows: [
      [
        {
          type: TextInput,
          label: 'Template Name',
          handle: 'name',
          required: true,
          instructions:
            'What this notification template will be called in the CP.',
          updateState: (value: string, state: GenericValue) => {
            return {
              ...state,
              handle: handle(camelCase(transliterate(value))),
            };
          },
        },
      ],
      [
        {
          type: TextTokens,
          label: 'Subject',
          handle: 'subject',
          required: true,
          instructions: 'The subject line for the email notification.',
        },
      ],
      [
        {
          type: HtmlBodyInput,
          label: 'Message Body',
          handle: 'body',
          instructions:
            'The content of the email notification. Use the `@` symbol to generate a list of tokens you can use. Twig is also allowed.',
        },
      ],
    ],
  },
  {
    name: translate('Configuration'),
    rows: [
      [
        {
          type: TextTokens,
          label: 'From Name',
          handle: 'fromName',
          required: true,
          instructions:
            'The name that the email will appear from in your email notification.',
        },
        {
          type: TextTokens,
          label: 'Reply-To Name',
          handle: 'replyToName',
          instructions:
            'The reply-to name that the email will appear from in your email notification.',
        },
      ],
      [
        {
          type: TextTokens,
          label: 'From Email',
          handle: 'fromEmail',
          required: true,
          instructions:
            'The email address that the email will appear from in your email notification.',
        },
        {
          type: TextTokens,
          label: 'Reply-To Email',
          handle: 'replyToEmail',
          instructions: `The reply-to email address for your email notification. Leave blank to use 'From Email' address.`,
        },
      ],
      [
        {
          type: TextTokens,
          label: 'CC',
          handle: 'cc',
          instructions: `The email address(es) you would like to be CC'd in the email notification. Separate multiples with commas. Leave blank to not use.`,
        },
        {
          type: TextTokens,
          label: 'BCC',
          handle: 'bcc',
          instructions: `The email address(es) you would like to be BCC'd in the email notification. Separate multiples with commas. Leave blank to not use.`,
        },
      ],
    ],
  },
  {
    name: translate('Advanced'),
    rows: [
      [
        {
          type: TextInput,
          label: 'Handle',
          handle: 'handle',
          instructions: 'Unique identifier for this template.',
          required: true,
          onChange: (value: string) => {
            return handle(value);
          },
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
          type: BooleanInput,
          label: 'Include Attachments',
          handle: 'includeAttachments',
          instructions:
            'Include uploaded files as attachments in email notification.',
        },
      ],
      [
        {
          type: AssetsInput,
          label: 'Predefined Assets',
          handle: 'presetAssets',
          minEdition: Edition.Pro,
          instructions:
            'Select any Assets you wish to include as attachments on all email notifications using this template.',
        },
      ],
    ],
  },
  {
    name: translate('Templates'),
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
          type: CheckboxesInput,
          label: 'PDF Templates',
          handle: 'pdfTemplateIds',
          minEdition: Edition.Pro,
          instructions: `Select any PDF templates to use for this notification.`,
          optionDefinition: async () => {
            const templates =
              await axios.get<{ id: string; name: string }[]>(
                '/api/templates/pdf'
              );

            return templates.data.map((template) => ({
              label: template.name,
              value: template.id,
            }));
          },
        },
      ],
    ],
  },
  {
    name: translate('Preview'),
    rows: [
      [
        {
          type: TemplatePreview,
          label: 'Preview',
          handle: 'preview',
          instructions: `This will give you a rough idea of how your notification will look to the recipient.`,
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
