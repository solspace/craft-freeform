import { animated } from 'react-spring';
import {
  borderRadius,
  colors,
  shadows,
  spacings,
} from '@ff-client/styles/variables';
import styled from 'styled-components';

export const OptionPickerWrapper = styled.div`
  position: relative;
`;

export const PickerInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: start;
  align-items: center;
  gap: 3px;

  padding: ${spacings.xs};

  border: 1px solid ${colors.inputBorder};
  border-radius: ${borderRadius.lg};
`;

export const Picker = styled.div`
  display: flex;
  align-items: stretch;

  padding: 0;

  border-radius: ${borderRadius.md};
  background: ${colors.gray100};
`;

export const PickerText = styled.span`
  padding: 1px ${spacings.sm};
`;

export const PickerClose = styled.button`
  display: flex;
  align-items: center;

  padding: 0 2px;
  margin: 0;

  border: none;
  border-left: 1px solid ${colors.hairline};
  border-top-right-radius: ${borderRadius.md};
  border-bottom-right-radius: ${borderRadius.md};
  background: transparent;

  transition: all 0.2s ease-in-out;

  &:hover {
    background: ${colors.gray200};
    border-left-color: transparent;
  }

  svg {
    width: 1.2em;
  }
`;

export const OptionsRollout = styled(animated.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;

  background-color: ${colors.gray050};
  border-radius: ${borderRadius.lg};
  box-shadow: ${shadows.container};

  overflow: hidden;
`;
