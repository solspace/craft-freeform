import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xl};

  h3 {
    font-size: 1.1em;
    margin-bottom: 0;
  }
`;

export const ChartContainer = styled.div`
  padding-bottom: ${spacings.xl};
  border-bottom: 1px solid ${colors.gray200};
`;

export const ChartDescription = styled.p`
  color: ${colors.gray600};
  font-size: 0.9em;
  text-align: center;
  margin: ${spacings.md} 0 0;
`;

export const NoResults = styled.div`
  color: ${colors.gray600};
  font-size: 0.9em;
  text-align: center;
  padding: ${spacings.xl} 0;
`;

export const TotalCount = styled.div`
  font-size: 14px;
  color: ${colors.gray800};
  margin-bottom: ${spacings.sm};
`;

export const StatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
  padding: 0 ${spacings.md};
`;

export const MostRecentTests = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.md};
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

export const StatRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
`;

export const StatLabel = styled.div<{
  $type: 'success' | 'failed' | 'pending';
}>`
  color: ${({ $type }) =>
    $type === 'success'
      ? colors.teal700
      : $type === 'failed'
        ? colors.red700
        : colors.gray700};
  font-weight: 500;
`;

export const StatValue = styled.div`
  color: ${colors.gray700};
  font-weight: 500;
`;

export const ProgressBar = styled.div`
  height: 8px;
  background: ${colors.gray100};
  border-radius: 4px;
  overflow: hidden;
`;

export const Progress = styled.div<{
  $type: 'success' | 'failed' | 'pending';
  $percentage: number;
}>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: ${({ $type }) =>
    $type === 'success'
      ? colors.green600
      : $type === 'failed'
        ? colors.red600
        : colors.gray700};
  transition: width 0.3s ease;
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
  align-items: ${({ $isColumn }) => ($isColumn ? 'flex-start' : 'center')};
  flex-direction: ${({ $isColumn }) => ($isColumn ? 'column' : 'row')};
  justify-content: ${({ $isColumn }) =>
    $isColumn ? 'flex-start' : 'space-between'};
  gap: ${({ $isColumn }) => ($isColumn ? spacings.xs : '0')};
  margin-bottom: ${spacings.sm};

  &:last-child {
    margin-bottom: 0;
  }
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
