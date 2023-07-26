import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TemplateCard = styled(animated.li)`
  position: relative;
  cursor: pointer;

  min-width: 100px;
  max-width: 600px;

  padding: ${spacings.sm} ${spacings.md};

  background-color: ${colors.white};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};

  &:hover:not(.is-active) {
    z-index: 1;
    background-color: ${colors.gray200} !important;
  }

  &.is-active {
    color: ${colors.white};
    background-color: ${colors.gray500};
    border: 1px solid ${colors.gray300};
    
    &:hover {
      z-index: 1;
    }

    h4,
    .code,
    div {
      color: ${colors.white};
    }
  }
`;

export const Name = styled.h4`
  margin: 0;
  padding: 0;
  font-size: 12px;
`;

export const Subject = styled.div`
  position: relative;

  padding: 0 0 0 24px;

  font-size: 12px;
  color: ${colors.gray300};

  max-lines: 1;
  max-height: 60px;
  overflow: hidden;

  > svg {
    position: absolute;
    left: 0;
    top: 2px;

    width: 18px;
    height: 18px;
  }
`;

export const Id = styled.div`
  padding: 2px 0 1px;
  font-size: 10px !important;
  color: ${colors.gray300};
`;
