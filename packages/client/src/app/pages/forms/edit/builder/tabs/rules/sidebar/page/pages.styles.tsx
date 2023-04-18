import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const PageWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${spacings.md};
`;

export const PageButton = styled.button`
  padding: ${spacings.xs} ${spacings.md};

  text-align: left;
  background-color: ${colors.gray100};

  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};
`;
