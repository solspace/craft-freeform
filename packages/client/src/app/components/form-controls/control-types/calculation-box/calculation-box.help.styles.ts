import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const OperatorReferenceTitle = styled.div`
  font-style: italic;
  font-weight: 500;
  font-size: 14px;
  color: ${colors.gray400};
  break-inside: avoid;
`;

export const OperatorReference = styled.div`
  column-count: 4;
`;

export const OperatorReferenceItem = styled.div`
  font-size: 12px;
  break-inside: avoid;
  color: ${colors.gray300};
  margin: 0 0 0.8rem;
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};

  > span {
    font-size: 14px;
    font-weight: 500;
  }
`;

export const Operator = styled.div`
  display: flex;

  > mark {
    font-size: 12px;
    font-family: 'Courier New', Courier, monospace;
    padding: 0 ${spacings.xs};
    border-radius: ${borderRadius.md};
    background: ${colors.gray100};
    color: ${colors.gray500};
    margin-right: ${spacings.md};
    max-height: 20px;
  }
`;
