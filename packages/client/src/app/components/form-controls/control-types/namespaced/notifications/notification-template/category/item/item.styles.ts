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

  &:hover {
    z-index: 1;
  }
`;

export const Name = styled.h4`
  margin: 0;
  padding: 0;
`;

export const Subject = styled.div`
  position: relative;

  padding: 0 0 0 24px;

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
  font-size: 10px !important;
  color: ${colors.gray300};
`;
