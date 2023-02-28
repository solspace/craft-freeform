import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Overlay,
  Popover,
  SelectedColor,
  Swatch,
} from '@components/__refactor/form-controls/controls/color-picker.styles';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const ColorPicker: React.FC<FormControlType<string>> = ({
  value,
  property,
  onUpdateValue,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <BaseControl property={property}>
      <Swatch onClick={() => setShowColorPicker(!showColorPicker)}>
        <SelectedColor style={{ backgroundColor: value }} />
      </Swatch>
      {showColorPicker && (
        <Popover>
          <Overlay onClick={() => setShowColorPicker(false)} />
          <SketchPicker
            color={value}
            onChangeComplete={({ hex }) => onUpdateValue(hex)}
          />
        </Popover>
      )}
    </BaseControl>
  );
};

export default ColorPicker;
