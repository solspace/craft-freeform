import React from 'react';
import { modifySettings } from '@editor/store/slices/form';

import { LightSwitchInput } from '../inputs/lightswitch-input';
import { InputWrapper } from '../inputs/lightswitch-input.styles';
import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const Bool: React.FC<FormControlType<boolean>> = ({
  value,
  property,
  namespace,
  dispatch,
}) => (
  <BaseControl property={property}>
    <InputWrapper>
      <LightSwitchInput
        id={property.handle}
        enabled={value}
        onClick={() =>
          dispatch(
            modifySettings({
              key: property.handle,
              namespace,
              value: !value,
            })
          )
        }
      />
    </InputWrapper>
  </BaseControl>
);

export default Bool;
