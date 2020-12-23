import React from 'react';
import FieldContainer, { FieldContainerProps } from '../FieldContainer/FieldContainer';

interface Props extends FieldContainerProps {
  placeholder?: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TextField: React.FC<Props> = ({ description, placeholder, value, onChange }) => {
  return (
    <FieldContainer description={description}>
      <input type="text" placeholder={placeholder} value={value} onChange={onChange} className="text fullwidth" />
    </FieldContainer>
  );
};

export default TextField;
