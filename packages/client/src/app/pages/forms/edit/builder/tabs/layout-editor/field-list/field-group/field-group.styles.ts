import styled from 'styled-components';

import { spacings } from '@ff-client/styles/variables';

export const FieldGroupWrapper = styled.div``;

export const GroupTitle = styled.h2``;

export const List = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${spacings.sm};

  margin: 0;
  padding: 0;
`;
