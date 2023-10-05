import React from 'react';
import { useRenderContext } from '@components/form-controls/context/render.context';
import { ControlWrapper } from '@components/form-controls/control.styles';
import { FormErrorList } from '@components/form-controls/error-list';
import FormInstructions from '@components/form-controls/instructions';
import type { ControlType } from '@components/form-controls/types';
import type { BooleanProperty } from '@ff-client/types/properties';
import classes from '@ff-client/utils/classes';

import {
  CheckboxItem,
  CheckboxWrapper,
  LightSwitch,
  PrettyCheckbox,
  TextWrapper,
} from './bool.styles';

const Bool: React.FC<ControlType<BooleanProperty>> = ({
  value: enabled,
  property,
  errors,
  updateValue,
}) => {
  const { size } = useRenderContext();
  const { handle, label, width } = property;

  return (
    <ControlWrapper
      $width={width}
      className={classes(property.disabled && 'disabled')}
    >
      <CheckboxWrapper $size={size}>
        <CheckboxItem>
          {size === 'small' && (
            <PrettyCheckbox
              className={classes(enabled && 'checked')}
              onClick={() => updateValue(!enabled)}
            />
          )}
          {size === 'normal' && (
            <LightSwitch
              className={classes(enabled && 'on')}
              onClick={() => updateValue(!enabled)}
            />
          )}
        </CheckboxItem>
        <TextWrapper onClick={() => updateValue(!enabled)}>
          <label htmlFor={handle}>{label}</label>
          <FormInstructions instructions={property.instructions} />
        </TextWrapper>
      </CheckboxWrapper>
      <FormErrorList errors={errors} />
    </ControlWrapper>
  );
};

export default Bool;
