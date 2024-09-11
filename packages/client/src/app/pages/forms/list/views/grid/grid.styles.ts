import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
`;

export const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
`;

export const Cards = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${spacings.lg};
`;

export const GroupWrap = styled.div``;

export const GroupTitle = styled.h2`
  margin-bottom: 10px;
`;

export const ArchivedAndGroupWrapper = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  .edit-groups {
    justify-content: flex-end;
    margin-left: auto;
  }
`;

export const GroupsButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacings.xs};

  &:hover {
    color: var(--link-color);

    svg {
      path:last-of-type {
        stroke: var(--link-color);
      }
    }
  }
`;

export const ContentContainer = styled.div`
  width: 100%;
  max-width: 100%;
`;

export const LoadingWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${spacings.lg};
`;
