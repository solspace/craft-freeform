import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FieldGroupWrapper = styled.div`
  margin-bottom: ${spacings.xl};
`;

export const GroupTitle = styled.h2`
  position: relative;

  margin: 0;
  padding: 0 0 5px;

  button {
    position: absolute;
    top: 1px;
    right: 0;

    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
`;

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

  margin: 0;
  padding: 0;
`;
