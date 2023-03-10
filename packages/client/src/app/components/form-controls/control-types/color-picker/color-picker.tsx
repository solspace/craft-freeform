import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Overlay,
  Popover,
  SelectedColor,
  Swatch,
} from '@components/form-controls/control-types/color-picker/color-picker.styles';
import type { ControlType } from '@components/form-controls/types';

import { Control } from '../../control';

const ColorPicker: React.FC<ControlType<string>> = ({
  value,
  property,
  updateValue,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <Control property={property}>
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
