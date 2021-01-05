import React from 'react';
import FieldContainer, { FieldContainerProps } from '../FieldContainer/FieldContainer';

interface Props extends FieldContainerProps {
  value: boolean;
  onChange?: (value: boolean) => void;
}

const LightSwitchField: React.FC<Props> = ({ description, value, onChange }) => {
  return (
    <FieldContainer description={description}>
      <div className={`lightswitch ${value && 'on'}`} onClick={(): void => onChange(!value)}>
        <div className="lightswitch-container">
          <div className="handle" />
        </div>
      </div>
    </FieldContainer>
  );
};

export default LightSwitchField;
