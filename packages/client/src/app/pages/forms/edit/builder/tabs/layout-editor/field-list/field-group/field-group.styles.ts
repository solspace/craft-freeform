import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FieldGroupWrapper = styled.div`
  margin-bottom: ${spacings.lg};
`;

export const GroupTitle = styled.h2``;

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacings.sm};

  margin: 0;
  padding: 0;
`;
