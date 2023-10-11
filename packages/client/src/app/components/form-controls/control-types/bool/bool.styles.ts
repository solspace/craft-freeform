import type { RenderSize } from '@components/form-controls/context/render.context';
import {
  beziers,
  borderRadius,
  colors,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

type CheckboxWrapperProps = {
  $size?: RenderSize;
};

export const CheckboxWrapper = styled.div<CheckboxWrapperProps>`
  display: flex;
  justify-content: start;
  align-items: center;
  gap: ${spacings.sm};

  label {
    color: ${colors.gray550};
    font-weight: bold;
  }
`;

export const CheckboxItem = styled.div``;

export const TextWrapper = styled.div``;
export const Instructions = styled.div`
  color: ${colors.gray300};
  font-size: 12px;
  font-style: italic;
`;

export const LightSwitch = styled.div`
  position: relative;
  cursor: pointer;

  width: 34px;

  padding: 1px;

  border-radius: 12px;
  background-color: ${colors.gray400};

  transition: background-color 0.2s ${beziers.easeOut};

  &:after {
    content: '';

    display: block;

    width: 20px;
    height: 20px;

    border-radius: 10px;

    background-color: ${colors.white};
    transition: transform 0.2s ${beziers.bounce.easeOut};
  }

  &.on {
    background-color: ${colors.enabled};

    &:after {
      transform: translateX(12px);
    }
  }
`;

export const PrettyCheckbox = styled.div`
  position: relative;
  display: block;
  height: 16px;
  width: 16px;

  background-clip: padding-box;
  background-color: #fbfcfe;
  border: 1px solid rgba(96, 125, 159, 0.4);
  border-radius: ${borderRadius.sm};

  box-sizing: border-box;
  font-size: 0;

  &.checked {
    &:after {
      content: 'check';
      position: absolute;
      left: 0;
      top: -3px;

      display: block;

      font-family: Craft;
      font-size: 15px;
      color: ${colors.gray900};
    }
  }
`;
