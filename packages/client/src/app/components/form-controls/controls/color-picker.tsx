import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Overlay,
  Popover,
  SelectedColor,
  Swatch,
} from '@components/form-controls/controls/color-picker.styles';
import { modifySettings } from '@editor/store/slices/form';

import type { FormControlType } from '../types';

import { BaseControl } from './base-control';

const ColorPicker: React.FC<FormControlType<string>> = ({
  value,
  property,
  namespace,
  dispatch,
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
            onChangeComplete={({ hex }) =>
              dispatch(
                modifySettings({ key: property.handle, namespace, value: hex })
              )
            }
          />
        </Popover>
      )}
    </BaseControl>
  );
};

export default ColorPicker;
