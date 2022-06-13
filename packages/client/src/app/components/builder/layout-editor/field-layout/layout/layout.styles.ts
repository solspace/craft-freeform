import styled from 'styled-components';

import { BoxShadow } from '@ff-client/styles/variables';

export const Wrapper = styled(BoxShadow)`
  border: 3px dashed blue;

  display: flex;
  flex-direction: column;
  gap: var(--m);
`;
