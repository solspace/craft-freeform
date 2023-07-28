import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FieldWrapper = styled(animated.div)`
  display: flex;
  flex-direction: column;
  justify-content: center;

  flex: 1;

  overflow: hidden;
  padding: 5px 7px;

  width: 100%;
  height: 100%;

  background: ${colors.white};
  border: 1px solid rgba(96, 125, 159, 0.25);
  border-radius: ${borderRadius.md};

  transition: all 0.2s ease-out;

  &,
  * {
    cursor: pointer;
  }

  &.has-rule:not(.active) {
    border-right: 4px solid ${colors.gray200};
  }

  &.active {
    background-color: ${colors.teal550};
    color: white;
  }

  &.is-in-condition {
    border-left: 4px solid ${colors.teal550};

    &.not-equals {
      border-left-color: ${colors.red500};
    }
  }
`;

export const FieldInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${spacings.sm};

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Label = styled.label`
  flex: 1;

  line-height: 12px;
  font-family: monospace;
  font-size: 12px;
`;

export const Icon = styled.div`
  flex: 0 0 auto;

  width: 16px;
  height: 16px;
`;

export const Small = styled.small`
  display: block;
  padding-left: 24px;

  font-size: 10px;
  color: ${colors.gray300};
`;
