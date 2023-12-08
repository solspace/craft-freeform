import type { Meta, StoryObj } from '@storybook/react';

import { Dropdown } from './dropdown';

let value = '';

type Story = StoryObj<typeof Dropdown>;
const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  args: {
    value,
    onChange: (val) => (value = val),
    emptyOption: 'Please select an option.',
    options: [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
      {
        label: 'Option Group',
        children: [
          { label: 'Option 3', value: 'option-3' },
          { label: 'Option 4', value: 'option-4' },
          {
            label: 'Nested Sub Group',
            children: [
              { label: 'Option 5', value: 'option-5' },
              { label: 'Option 6', value: 'option-6' },
            ],
          },
        ],
      },
    ],
  },
};

export const Default: Story = {
  args: {},
};

export default meta;
