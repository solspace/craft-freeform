import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Overlay,
  Popover,
  SelectedColor,
  Swatch,
} from '@components/form-controls/inputs/color.styles';

import type { ControlProps } from '../control';
import { Control } from '../control';

export const Color: React.FC<ControlProps<string>> = ({
  id,
  value,
  label,
  onChange,
  instructions,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <Control id={id} label={label} instructions={instructions}>
      <Swatch onClick={() => setShowColorPicker(!showColorPicker)}>
        <SelectedColor style={{ backgroundColor: value }} />
      </Swatch>
      {showColorPicker && (
        <Popover>
          <Overlay onClick={() => setShowColorPicker(false)} />
          <SketchPicker
            color={value}
            onChangeComplete={({ hex }) => onChange && onChange(hex)}
          />
        </Popover>
      )}
    </Control>
  );
};
