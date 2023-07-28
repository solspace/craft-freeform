import { animated } from 'react-spring';
import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const GroupFieldLayoutWrapper = styled.div`
  position: relative;
  flex-grow: 1;

  height: 100%;
  padding: 8px;

  border: 1px solid #f2f4f7;
  border-radius: ${borderRadius.lg};
  background-color: #fcfdfe;
`;

export const GroupDropZone = styled(animated.div)`
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  background-color: ${colors.gray050};
  border: 1px solid transparent;
  border-radius: ${borderRadius.sm};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;

export const EmptyLayout = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  min-height: 40px;
  height: 100%;

  color: ${colors.gray200};
  font-size: 18px;
  text-align: center;
`;
