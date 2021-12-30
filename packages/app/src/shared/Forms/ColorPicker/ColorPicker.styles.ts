import styled from 'styled-components';

export const PreviewWrapper = styled.div`
  padding: 5px;
  background: #fff;
  border-radius: 1px;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  display: inline-block;
  cursor: pointer;
`;

export const Preview = styled.div`
  width: 36px;
  height: 14px;
  border-radius: 2px;
`;

export const PickerWrapper = styled.div`
  position: absolute;
  z-index: 2;
`;

export const PickerCover = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;
