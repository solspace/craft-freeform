import styled from 'styled-components';

export const TextTokenWrapper = styled.div`
  position: relative;
`;

export const TextTokenContainer = styled.div`
  span[data-freeform-token] {
    background-color: #e4edf6;
    border: 1px solid #33404d1a;
    border-radius: 3px;
    padding: 0.0625em 0.25em;

    &[data-selected] {
      outline: 3px solid #0078d4 !important;
    }
  }
`;

export const AddButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;

  margin: 4px;
  padding: 0 8px;

  height: 26px;
  min-height: 26px;
`;
