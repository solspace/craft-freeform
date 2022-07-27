import styled from 'styled-components';

import { BoxShadow, spacings } from '@ff-client/styles/variables';

export const Wrapper = styled(BoxShadow)`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};

  padding: ${spacings.md};
`;
