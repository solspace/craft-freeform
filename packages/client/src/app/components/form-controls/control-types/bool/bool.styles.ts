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

  padding: 2px;

  border-radius: 11px;
  background-image: linear-gradient(to right, var(--gray-400), var(--gray-400));
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);

  transition: background-color 0.2s ${beziers.easeOut};

  &:after {
    content: '';

    display: block;

    width: 18px;
    height: 18px;

    inset-inline-start: calc(50% - 9px);
    border-radius: 9px;

    background-color: ${colors.white};
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ${beziers.bounce.easeOut};
  }

  &.on {
    background-image: linear-gradient(
      to right,
      var(--enabled-color),
      var(--enabled-color)
    );

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
