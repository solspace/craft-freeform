import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const CellFieldWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: ${spacings.sm};

  overflow: hidden;
  padding: 0 7px;

  width: 100%;
  height: 28px;

  background: ${colors.white};
  border: 1px solid rgba(96, 125, 159, 0.25);
  border-left: 3px solid ${colors.red200};
  border-radius: ${borderRadius.md};

  &.active {
    background-color: ${colors.gray100};
  }
`;

export const Label = styled.label`
  flex: 1;

  line-height: 12px;
  font-family: monospace;
  font-size: 12px;
`;

export const Icon = styled.div`
  flex: 0 0 auto;

  width: 16px;
  height: 16px;
`;
