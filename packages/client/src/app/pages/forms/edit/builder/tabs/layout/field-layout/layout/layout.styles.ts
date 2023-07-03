import { animated } from 'react-spring';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PageFieldLayoutWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  margin: 0 -18px;
`;

export const DropZone = styled(animated.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 28px;
  margin: 0 ${spacings.lg};

  background-color: ${colors.gray050};
  border: 1px solid ${colors.hairline};
  border-radius: ${borderRadius.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;

export const EmptyLayout = styled.div`
  padding: ${spacings.sm} ${spacings.lg};

  color: ${colors.gray300};
  font-size: 18px;
  text-align: left;
`;
