import { colors } from '@ff-client/styles/variables';
import type { FlattenSimpleInterpolation } from 'styled-components';
import styled, { css } from 'styled-components';

export const Handle = styled.div`
  position: absolute;
  top: 1px;
  left: 1px;

  width: 20px;
  height: 20px;

  border-radius: 10px;
  background-color: ${colors.white};

  transition: left 0.1s ease-out;
`;

type WrapperProps = {
  enabled?: boolean;
};

const enabledButtonStyles = css`
  background-image: linear-gradient(
    to right,
    ${colors.teal550},
    ${colors.teal550}
  );

  > ${Handle} {
    left: calc(100% - 21px);
  }
`;

export const Wrapper = styled.button<WrapperProps>`
  cursor: pointer;
  position: relative;

  display: block;
  overflow: hidden;

  width: 34px;
  height: 22px;

  border: none;
  border-radius: 11px;

  user-select: none;
  transition: background-image 0.1s linear;
  background-image: linear-gradient(
    to right,
    ${colors.gray400},
    ${colors.gray400}
  );

  ${({ enabled }): FlattenSimpleInterpolation => enabled && enabledButtonStyles}
`;
