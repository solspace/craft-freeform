import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Overlay,
  Popover,
  SelectedColor,
  Swatch,
} from '@components/form-controls/control-types/color-picker/color-picker.styles';
import type { ControlType } from '@components/form-controls/types';
import type { ColorProperty } from '@ff-client/types/properties';

import { Control } from '../../control';

const ColorPicker: React.FC<ControlType<ColorProperty>> = ({
  value,
  property,
  errors,
  updateValue,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <Control property={property} errors={errors}>
      <Swatch onClick={() => setShowColorPicker(!showColorPicker)}>
        <SelectedColor style={{ backgroundColor: value }} />
      </Swatch>
      {showColorPicker && (
        <Popover>
          <Overlay onClick={() => setShowColorPicker(false)} />
          <SketchPicker
            color={value}
            onChangeComplete={({ hex }) => updateValue(hex)}
          />
        </Popover>
      )}
    </Control>
  );
};

export default ColorPicker;
