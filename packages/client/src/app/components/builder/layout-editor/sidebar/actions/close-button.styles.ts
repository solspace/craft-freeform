import styled from 'styled-components';

const size = 20;

export const Button = styled.a`
  position: absolute;
  right: -${size / 2}px;
  top: -${size / 2}px;

  display: block;
  width: ${size}px;
  height: ${size}px;
`;
