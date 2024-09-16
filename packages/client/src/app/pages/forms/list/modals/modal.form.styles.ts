import { spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const FormWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};

  padding: ${spacings.md} ${spacings.xl};
`;
