import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const EditableLabelWrapper = styled.div`
  &.errors {
    span {
      color: ${colors.red500};
    }
  }

  input {
    padding: 7.75px ${spacings.sm};
    font-size: 18px;
    font-weight: bold;

    margin-left: -9px;
  }
`;

export const EditButton = styled(animated.button)`
  position: absolute;
  top: 0;
  right: -25px;

  opacity: 0;

  width: 20px;
  height: 20px;

  > svg {
    width: 100%;
    height: 100%;

    color: ${colors.gray400};
  }
`;

export const Label = styled(animated.h1)`
  cursor: pointer;

  min-height: 10px;

  margin: 0 0 0 -8px;
  padding: ${spacings.sm} 40px ${spacings.sm} ${spacings.sm};

  border: 0px solid transparent;
  border-radius: ${borderRadius.lg};

  > span {
    position: relative;
    display: inline-block;

    > span:empty:after {
      content: 'No Title';

      color: ${colors.gray300};
      font-style: italic;
    }
  }
`;
