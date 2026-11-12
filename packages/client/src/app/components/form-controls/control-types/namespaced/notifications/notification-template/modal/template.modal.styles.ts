import { ModalContainer } from "@components/modals/modal.styles";
import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const Container = styled(ModalContainer)`
  display: grid;
  grid-template-rows: min-content min-content 70vh min-content;

  max-width: 70vw;
  min-width: 600px;
`;

export const ModalContent = styled.div`
  padding: 1rem 2rem;

  overflow-y: auto;
  ${scrollBar};
`;

export const TabList = styled.div`
  padding-block-start: var(--c-spacing-md);
  padding-inline: var(--c-spacing-xl);
  craft-tabs { --c-tabs-tab-gap: 24px; }
  craft-tab.errors { color: var(--c-color-danger-on-quiet); }
`;

export const TabContent = styled.div``;

export const Row = styled.div`
  display: flex;
  gap: 1rem;

  > div {
    flex: 1 0;
    min-width: 0;
    padding: 0.5rem 0;
  }
`;
