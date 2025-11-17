import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TestActionSection = styled.div`
  padding: ${spacings.xl};
  border-bottom: 1px solid ${colors.gray200};
`;

export const DescriptionText = styled.div`
  margin-bottom: ${spacings.lg};
  color: ${colors.gray600};
  font-size: 0.9em;
`;

export const TestButton = styled.button`
  width: 100%;
  margin-top: ${spacings.lg};
`;

export const EmptyState = styled.div`
  color: ${colors.gray600};
  padding: ${spacings.lg};
  text-align: center;
`;

export const HistorySection = styled.div`
  padding: ${spacings.xl};
  height: 300px;
  display: flex;
  flex-direction: column;

  h3 {
    margin: 0 0 ${spacings.lg} 0;
    font-size: 1.1em;
    font-weight: 600;
  }
`;

export const TestEmailTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: ${colors.white};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
  margin-top: -1px;

  thead {
    background: ${colors.gray050};
    display: table;
    width: 100%;
    table-layout: fixed;

    th {
      padding: ${spacings.md} ${spacings.lg};
      font-weight: 600;
      color: ${colors.gray700};
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid ${colors.gray200};
    }
  }

  tbody {
    display: block;
    max-height: 200px;
    overflow-y: auto;

    tr {
      display: table;
      width: 100%;
      table-layout: fixed;
      transition: background-color 0.2s ease;

      &:hover {
        background: ${colors.gray050};
      }
    }

    td {
      padding: ${spacings.md} ${spacings.lg};
      vertical-align: middle;

      &.no-break {
        white-space: nowrap;
      }
    }
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${borderRadius.md};
  font-size: 0.85em;
  font-weight: 600;
  text-transform: uppercase;

  &.success {
    background-color: ${colors.teal050};
    color: ${colors.teal700};
  }

  &.error {
    background-color: ${colors.red050};
    color: ${colors.red700};
  }

  &.pending {
    background-color: ${colors.yellow050};
    color: ${colors.yellow700};
  }
`;

export const SuccessMessage = styled.div`
  margin-top: ${spacings.lg};
  padding: ${spacings.md};
  background-color: ${colors.teal050};
  color: ${colors.teal700};
  border-radius: ${borderRadius.md};
`;

export const ErrorMessage = styled.div`
  margin-top: ${spacings.lg};
  padding: ${spacings.md};
  background-color: ${colors.red050};
  color: ${colors.red700};
  border-radius: ${borderRadius.md};
`;

export const WarningMessage = styled.div`
  margin-top: ${spacings.lg};
  padding: ${spacings.md};
  background-color: ${colors.yellow050};
  color: ${colors.yellow700};
  border-radius: ${borderRadius.md};
`;
