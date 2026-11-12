import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const PageTabsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: var(--freeform-builder-padding-block, calc(var(--c-spacing-lg) + var(--c-spacing-md))) var(--c-spacing-lg) var(--c-spacing-md);
`;

export const PageTabsContainer = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  gap: var(--c-spacing-sm);
  overflow-y: hidden;
  overflow-x: auto;
  ${scrollBar};

  &::-webkit-scrollbar-thumb {
    visibility: hidden;
  }

  &:hover {
    &::-webkit-scrollbar-thumb {
      visibility: visible;
    }
  }
`;
