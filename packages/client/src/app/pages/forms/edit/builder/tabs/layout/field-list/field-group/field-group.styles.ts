import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FieldGroupWrapper = styled.div`
  margin-bottom: ${spacings.xl};
`;

export const GroupTitle = styled.h2`
  margin: 0;
  padding: 0 0 5px;
`;

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px;

  margin: 0;
  padding: 0;
`;
