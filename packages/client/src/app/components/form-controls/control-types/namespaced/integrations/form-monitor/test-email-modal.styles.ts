import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const TestActionSection = styled.div`
  padding: ${spacings.xl};
  border-bottom: 1px solid ${colors.gray200};
`;

export const DescriptionText = styled.div`
  margin-bottom: ${spacings.lg};
  color: ${colors.gray600};
  font-size: 0.9em;
`;

export const TestEmailButton = styled.button`
  align-self: flex-start;
  width: fit-content;
`;

export const TestButton = styled(TestEmailButton)`
  margin-top: ${spacings.lg};
`;

export const EmptyState = styled.div`
  color: ${colors.gray600};
  padding: ${spacings.lg};
  text-align: center;
`;

export const HistorySection = styled.div`
  padding: ${spacings.xl};
  display: flex;
  flex-direction: column;
  min-width: 0;

  h3 {
    margin: 0 0 ${spacings.lg} 0;
    font-size: 1.1em;
    font-weight: 600;
  }
`;

export const HistoryContent = styled.div`
  max-height: 200px;
  overflow-y: auto;
  min-width: 0;
`;

export const TestEmailTable = styled.table.attrs({
  className: "freeform-ui-table",
})`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: light-dark(${colors.white}, ${colors.surface});
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.lg};
  margin-top: -1px;

  thead {
    background: ${colors.gray050};

    th {
      position: sticky;
      top: 0;
      background: ${colors.gray050};
      padding: ${spacings.md} ${spacings.lg};
      font-weight: 600;
      color: ${colors.gray700};
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid ${colors.gray200};
    }
  }

  tbody {
    tr {
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
    background-color: light-dark(${colors.teal050}, var(--bg-success));
    color: light-dark(${colors.teal700}, var(--fg-success));
  }

  &.error {
    background-color: light-dark(${colors.red050}, var(--bg-error));
    color: light-dark(${colors.red700}, var(--fg-error));
  }

  &.pending {
    background-color: light-dark(${colors.yellow050}, var(--bg-warning));
    color: light-dark(${colors.yellow700}, var(--fg-warning));
  }
`;

export const SuccessMessage = styled.div`
  margin-top: ${spacings.lg};
  padding: ${spacings.md};
  background-color: light-dark(${colors.teal050}, var(--bg-success));
  color: light-dark(${colors.teal700}, var(--fg-success));
  border-radius: ${borderRadius.md};
`;

export const ErrorMessage = styled.div`
  margin-top: ${spacings.lg};
  padding: ${spacings.md};
  background-color: light-dark(${colors.red050}, var(--bg-error));
  color: light-dark(${colors.red700}, var(--fg-error));
  border-radius: ${borderRadius.md};
`;

export const WarningMessage = styled.div`
  margin-top: ${spacings.lg};
  padding: ${spacings.md};
  background-color: light-dark(${colors.yellow050}, var(--bg-warning));
  color: light-dark(${colors.yellow700}, var(--fg-warning));
  border-radius: ${borderRadius.md};
`;
