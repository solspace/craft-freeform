import { scrollBar } from '@ff-client/styles/mixins';
import styled from 'styled-components';

export const PageTabsWrapper = styled.div`
  margin: 10px 15px;
`;

export const PageTabsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: 4px;
  overflow-y: hidden;
  overflow-x: auto;
  ${scrollBar};

  &::-webkit-scrollbar-thumb {
    visibility: hidden;
  }

  &:hover {
    background-color: white;

    &::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  }
`;
