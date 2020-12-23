import React from 'react';
import { CSSTransition } from 'react-transition-group';
import { ButtonRow, Wrapper } from './ButtonCollection.styles';

export interface Button {
  label: string;
  cta?: boolean;
  onClick?: () => void;
}

interface Props {
  step: number;
  buttons: Button[][];
}

const ButtonCollection: React.FC<Props> = ({ step, buttons }) => {
  return (
    <Wrapper>
      {buttons.map((row, rowIndex) => (
        <CSSTransition
          key={rowIndex}
          unmountOnExit
          mountOnEnter
          in={step === rowIndex}
          timeout={300 + row.length * 50}
          classNames="animation"
        >
          <ButtonRow>
            {row.map((button, index) => (
              <button key={index} onClick={button.onClick} className={`btn ${button.cta && 'submit'}`}>
                {button.label}
              </button>
            ))}
          </ButtonRow>
        </CSSTransition>
      ))}
    </Wrapper>
  );
};

export default ButtonCollection;
