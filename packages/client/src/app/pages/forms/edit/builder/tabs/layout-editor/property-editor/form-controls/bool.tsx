import React from 'react';
import { CheckboxInput } from '@ff-client/app/components/form-controls/inputs/checkbox-input';
import { edit } from '@ff-client/app/pages/forms/edit/store/slices/fields';

import { CheckboxWrapper } from './bool.styles';
import { ControlWrapper } from './control.styles';
import type { ControlType } from './types';

const Bool: React.FC<ControlType> = ({ field, property, dispatch }) => {
  const { handle, label } = property;
  const { uid, properties } = field;

  const enabled = (properties[handle] as boolean) ?? false;

  return (
    <ControlWrapper>
      <CheckboxWrapper>
        <CheckboxInput
          id={handle}
          label={label}
          checked={enabled}
          onChange={() => dispatch(edit({ uid, property, value: !enabled }))}
        />
      </CheckboxWrapper>
    </ControlWrapper>
  );
};

export default Bool;
