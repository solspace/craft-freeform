import { animated } from 'react-spring';
import styled from 'styled-components';

export const WrapperEditor = styled(animated.div)`
  padding: 0;
  width: 40vw;
  z-index: 99999;
  margin: 10px 0 0;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 300px;
  position: relative;
  background-color: var(--gray-050);
  border: 1px solid rgba(0, 0, 0, 0.1);
  transition: opacity 100ms ease-in-out;
`;

export const Buttons = styled.div`
  display: flex;
  padding: 10px;
  margin: 0 0 10px;
  align-items: center;
  background-color: #f2f2f2;
  justify-content: flex-end;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

export const Button = styled.a`
  width: 20px;
  height: 20px;
`;
