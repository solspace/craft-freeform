import type { Meta, StoryObj } from '@storybook/react';

import { TokenInput } from './token-input';

let value = '[]';

type Story = StoryObj<typeof TokenInput>;
const meta: Meta<typeof TokenInput> = {
  title: 'Components/TokenInput',
  component: TokenInput,
  args: {
    value,
    allowCustom: true,
    options: [],
    placeholder: 'Type to add a tag',
    onChange: (val) => (value = JSON.stringify(val)),
  },
  argTypes: {
    value: {
      control: {
        type: 'text',
      },
    },
    onChange: {
      action: 'changed',
    },
    allowCustom: {
      control: {
        type: 'boolean',
      },
    },
    options: {
      control: {
        type: 'object',
      },
    },
    placeholder: {
      control: {
        type: 'text',
      },
    },
  },
};

export const Default: Story = {
  args: {
    value: '["1", "2"]',
    options: [
      {
        value: '1',
        name: 'Option 1',
      },
      {
        value: '2',
        name: 'Option 2',
      },
      {
        value: '3',
        name: 'Option 3 (non-editable)',
        editable: false,
      },
    ],
  },
};

export default meta;
