import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const OperatorReferenceTitle = styled.div`
  font-style: italic;
  font-weight: 500;
  font-size: 15px;
  color: ${colors.gray500};
  break-inside: avoid;
`;

export const OperatorReference = styled.div`
  column-count: 4;
`;

export const OperatorReferenceItem = styled.div`
  break-inside: avoid;
  color: ${colors.gray400};
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  > span {
    font-size: 16px;
    font-weight: 500;
  }
`;

export const Operator = styled.div`
  display: flex;

  > mark {
    padding: 0 ${spacings.xs};
    border-radius: ${borderRadius.lg};
    background: ${colors.gray200};
    color: ${colors.gray400};
    margin-right: ${spacings.md};
    max-height: 20px;
  }
`;
