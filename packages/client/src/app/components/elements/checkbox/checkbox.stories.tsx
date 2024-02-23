import React from 'react';
import { Control } from '@components/form-controls/control';
import { PropertyType } from '@ff-client/types/properties';
import type { Meta, StoryObj } from '@storybook/react';

import { Checkbox } from './checkbox';

type Story = StoryObj<typeof Checkbox>;
const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {},
  render: (args) => (
    <Control
      property={{
        type: PropertyType.OptionPicker,
        label: 'Checkbox',
        handle: 'checkbox',
        instructions: 'This is a Checkbox component.',
      }}
    >
      <Checkbox {...args} />
    </Control>
  ),
};

export const Default: Story = {
  args: {
    checked: false,
  },
};

export default meta;
