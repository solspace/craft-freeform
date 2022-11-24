import styled from 'styled-components';

export const Swatch = styled.div`
  margin: 0;
  padding: 5px;
  cursor: pointer;
  border-radius: 1px;
  display: inline-block;
  background-color: #ffffff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);,
`;

export const SelectedColor = styled.div`
  margin: 0;
  padding: 0;
  width: 36px;
  height: 14px;
  border-radius: 2px;
`;

export const Popover = styled.div`
  z-index: 2;
  position: absolute;
`;

export const Overlay = styled.div`
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  position: fixed;
`;
