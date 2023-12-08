import React from 'react';
import { Control } from '@components/form-controls/control';
import { PropertyType } from '@ff-client/types/properties';
import type { Meta, StoryObj } from '@storybook/react';

import { OptionPicker } from './option-picker';

type Story = StoryObj<typeof OptionPicker>;
const meta: Meta<typeof OptionPicker> = {
  title: 'Components/Option Picker',
  component: OptionPicker,
  args: {
    value: ['option-1', 'option-4'],
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
  render: (args) => (
    <Control
      property={{
        type: PropertyType.OptionPicker,
        label: 'Option Picker',
        handle: 'option-picker',
        instructions:
          'This is an option picker component, letting you select multiple options.',
        value: ['test'],
      }}
    >
      <OptionPicker {...args} />
    </Control>
  ),
};

export const Default: Story = {
  args: {},
};

export default meta;
