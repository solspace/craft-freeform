import styled from 'styled-components';

export const TriggerButton = styled.button`
  &:after {
    margin-left: 0 !important;
  }
`;

export const PopupMenu = styled.div`
  position: absolute;
  left: 0;
  top: 24px;
  z-index: 10;

  background: white;

  ul {
    li {
      margin: 0 !important;
    }
  }
`;
