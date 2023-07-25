import { scrollBar } from '@ff-client/styles/mixins';
import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: flex;
  flex: 1 0;
  flex-direction: column;
  gap: ${spacings.md};

  padding: ${spacings.sm} ${spacings.xl} ${spacings.xl};

  overflow-y: auto;
  overflow-x: hidden;
  ${scrollBar};
`;
