import React, { useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { useClickOutside } from '../Checkbox/hooks/use-click-outside';

import type { FieldProps } from '../FieldBase/FieldBase';
import FieldBase from '../FieldBase/FieldBase';
import { ChangeHandler } from '../types';
import { PickerWrapper, Preview, PreviewWrapper } from './ColorPicker.styles';

interface Props extends FieldProps {
  onChange?: ChangeHandler;
  value?: string;
}

const ColorPicker: React.FC<Props> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const { onChange, name, value } = props;

  const ref = useRef(null);

  useClickOutside(ref, (): void => setIsOpen(false));

  return (
    <FieldBase {...props}>
      <PreviewWrapper onClick={(): void => setIsOpen(!isOpen)}>
        <Preview style={{ backgroundColor: value }} />
      </PreviewWrapper>

      {isOpen && (
        <PickerWrapper ref={ref}>
          <SketchPicker color={value} onChange={({ hex }): void => onChange(name, hex)} disableAlpha />
        </PickerWrapper>
      )}
    </FieldBase>
  );
};

export default ColorPicker;
