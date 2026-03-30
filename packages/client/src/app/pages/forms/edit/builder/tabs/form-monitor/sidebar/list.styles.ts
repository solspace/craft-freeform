import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  h3 {
    font-size: 1.1em;
    margin-bottom: 0.3em;
  }
`;

export const StatContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${spacings.md};
`;

export const MainStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
`;

export const MostRecentTests = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${spacings.md};
  padding-bottom: ${spacings.md};
  border-bottom: 1px solid ${colors.gray200};

  .status-success,
  .status-failed,
  .status-pending {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 24px;
    font-weight: 600;

    .status-main {
      display: flex;
      align-items: center;
      gap: ${spacings.sm};
      margin-bottom: 12px;
    }

    &.status-success {
      color: ${colors.green600};
    }

    &.status-failed {
      color: ${colors.red600};
    }

    &.status-pending {
      color: ${colors.gray700};
    }

    small {
      display: flex;
      align-items: center;
      gap: 4px;
      color: ${colors.gray500};
      font-size: 12px;
      font-weight: 300;
      margin-top: 4px;

      .status-text {
        font-weight: 600;
        font-size: 12px;

        &.status-success {
          color: ${colors.green600};
        }

        &.status-failed {
          color: ${colors.red600};
        }

        &.status-pending {
          color: ${colors.gray700};
        }
      }
    }
  }
`;

export const ConfigurationSection = styled.div`
  padding: 0 ${spacings.md};
  h3 {
    margin: 0 0 ${spacings.md};
  }
`;

export const ConfigWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
`;

export const ConfigItem = styled.div<{ $isColumn?: boolean }>`
  display: flex;
  flex-direction: ${({ $isColumn }) => ($isColumn ? "column" : "row")};
  justify-content: ${({ $isColumn }) =>
    $isColumn ? "flex-start" : "space-between"};
  gap: ${({ $isColumn }) => ($isColumn ? spacings.xs : "0")};
  margin-bottom: ${spacings.sm};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const StatusContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${spacings.xs};
`;

export const ReactivateButton = styled.button`
  padding: 3px 8px;
  background-color: ${colors.gray700};
  margin-top: ${spacings.xs};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const StatusMessage = styled.div<{ $error?: boolean }>`
  color: ${({ $error }) => ($error ? colors.red600 : "inherit")};
  font-style: italic;
  font-size: 0.9em;
  text-align: right;
`;

export const ConfigLabel = styled.div`
  color: ${colors.gray600};
  font-size: 13px;
  font-weight: 500;
`;

export const ConfigValue = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.xs};
  font-size: 13px;
`;

export const MonitoredUrl = styled.code`
  display: block;
  padding: ${spacings.xs};
  background: ${colors.gray100};
  border-radius: 3px;
  font-size: 12px;
  word-break: break-all;
  color: ${colors.gray700};
`;

export const NextScheduledTestContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${spacings.md};
  padding-bottom: ${spacings.xl};
  border-bottom: 1px solid ${colors.gray200};

  h3 {
    margin-bottom: ${spacings.sm};
    font-size: 1.1em;
    font-weight: 600;
    color: ${colors.gray700};
  }

  .next-test-time {
    font-size: 14px;
    color: ${colors.gray600};
  }
`;

export const ActionContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
  margin-top: ${spacings.lg};
  position: relative;
`;

export const MenuButton = styled.button`
  height: var(--ui-control-height);
  width: var(--ui-control-height);
  border: 1px solid ${colors.gray250};
  border-radius: ${borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.gray700};
  padding: 0;

  svg {
    width: 16px;
    height: 16px;
    stroke: ${colors.gray500};
  }

  &:hover {
    background: rgba(96, 125, 159, 0.3);
  }
`;

export const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 250px;
  z-index: 100;
  margin-top: ${spacings.sm};
`;

export const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};
  width: 100%;
  padding: ${spacings.sm} ${spacings.md};
  border: none;
  background: none;
  cursor: pointer;
  color: ${colors.gray700};
  font-size: 12px;
  text-align: left;

  svg {
    width: 16px;
    height: 16px;
    stroke: currentColor;
  }

  &:hover {
    background: ${colors.gray050};
  }
`;

export const MenuItemWithBorder = styled(MenuItem)`
  border-top: 1px solid ${colors.gray200};
  color: ${colors.red600};

  svg {
    stroke: ${colors.red600};
  }

  &:hover {
    background: ${colors.red050};
  }
`;
