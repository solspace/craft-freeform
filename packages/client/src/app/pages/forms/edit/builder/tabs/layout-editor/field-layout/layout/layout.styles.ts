import { animated } from 'react-spring';
import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FieldLayoutWrapper = styled.div`
  position: relative;

  display: flex;
  flex-direction: column;

  height: 100%;
  padding-bottom: 60px;
  margin: 0 -18px;
`;

export const DropZone = styled(animated.div)`
  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;
  height: 28px;

  background-color: ${colors.gray050};
  border: 1px solid ${colors.hairline};
  border-radius: ${borderRadius.md};

  font-size: 12px;
  line-height: 12px;

  text-align: center;
  font-family: monospace;
`;
