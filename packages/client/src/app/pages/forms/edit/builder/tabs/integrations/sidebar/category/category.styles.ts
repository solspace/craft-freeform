import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div``;

export const Label = styled.span`
  padding-left: ${spacings.md};

  font-weight: 700;
  font-size: 11px;
  color: ${colors.gray550};

  text-transform: uppercase;
`;

export const ChildrenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  padding: ${spacings.xs} 0;
`;
