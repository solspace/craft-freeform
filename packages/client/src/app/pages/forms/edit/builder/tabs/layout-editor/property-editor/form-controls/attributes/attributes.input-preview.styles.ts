import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const CodeBlock = styled.div`
  position: relative;

  padding: ${spacings.sm} ${spacings.md};

  font-family: monospace;

  background: ${colors.gray050};
  border: 1px solid ${colors.hairline};
  border-bottom: none;
  border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
`;

export const Name = styled.span`
  color: ${colors.teal700};
`;

export const Operator = styled.span`
  color: ${colors.gray300};
`;

export const Quote = styled.span`
  &:before {
    content: '"';
    color: ${colors.gray300};
  }
`;

export const Value = styled.span`
  color: ${colors.red300};
`;
