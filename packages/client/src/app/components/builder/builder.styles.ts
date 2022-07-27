import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  box-shadow: 0 0 0 1px ${colors.gray200}, 0 2px 12px rgb(205 216 228 / 50%);
  border-radius: ${borderRadius.lg};
`;
