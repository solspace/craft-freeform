import { scrollBar } from '@ff-client/styles/mixins';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ResultsWrapper = styled.div`
  flex: 1;
  background: ${colors.white};
  padding: ${spacings.xl};
  overflow-y: auto;
  width: calc(100% - 300px);
  ${scrollBar};

  div[class^='ControlWrapper-'] {
    div[class^='CheckboxWrapper-'] {
      align-items: start;

      div[class^='CheckboxItem-'] {
        padding-top: 4px;
      }
    }
  }

  h3 {
    font-size: 1.3em;
    margin-bottom: 0;
  }
`;

export const NoResults = styled.div`
  color: ${colors.gray700};

  p {
    color: ${colors.gray600};
    font-size: 0.9em;
  }
`;

export const StatsContainer = styled.div`
  padding: ${spacings.sm};
`;

export const ChartContainer = styled.div`
  background: ${colors.white};
  border-radius: 4px;
`;

export const TestDescription = styled.p`
  color: ${colors.gray600};
  font-size: 0.9em;
  margin-bottom: ${spacings.md};
  margin-top: 0;
`;

export const TableTestList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${spacings.sm};
`;

export const TableHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.sm};
  margin-bottom: ${spacings.lg};
`;

export const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacings.md};
  margin-top: ${spacings.xl};
  padding-top: ${spacings.lg};
  border-top: 1px solid ${colors.gray200};
`;

export const PaginationNav = styled.nav`
  display: flex;
  gap: ${spacings.xs};
`;

export const PageButton = styled.button<{ disabled?: boolean }>`
  width: 32px;
  height: 32px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.sm};
  background: ${colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: ${colors.blue500};
    &::after {
      border-color: ${colors.blue500};
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: '';
    display: block;
    width: 7px;
    height: 7px;
    border: solid ${colors.gray700};
    border-width: 0 2px 2px 0;
    opacity: 0.8;
    position: relative;
  }

  &.prev-page::after {
    transform: rotate(135deg);
    right: -1px;
  }

  &.next-page::after {
    transform: rotate(-45deg);
    left: -1px;
  }

  &:disabled::after {
    border-color: ${colors.gray300};
  }
`;

export const PageInfo = styled.div`
  color: ${colors.gray600};
  font-size: 13px;
`;

export const ResponseBlock = styled.div`
  max-width: 380px;
`;

export const ResponseText = styled.div`
  position: relative;
  font-family: monospace;
  font-size: 12px;
  line-height: 1.4;
  border-radius: ${borderRadius.md};
  white-space: normal;
`;

export const TestTableStyled = styled.table`
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
    td {
      padding: ${spacings.md} ${spacings.lg};
      vertical-align: middle;

      &.no-break {
        white-space: nowrap;
      }

      &.code {
        font-family: monospace;
        font-size: 12px;
      }

      .view-screenshot-btn {
        padding: 0;
        background: none;
        color: ${colors.blue500};
        border: none;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: color 0.2s ease;

        &:hover {
          color: ${colors.blue600};
          text-decoration: underline;
        }
      }
    }

    tr {
      transition: background-color 0.2s ease;

      &:hover {
        background: ${colors.gray050};
      }
    }
  }
`;

export const TestTooltip = styled.div`
  overflow: hidden;
  min-width: 160px;
`;

export const TestTooltipHeader = styled.div`
  padding: ${spacings.xs} ${spacings.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const TestTooltipContent = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${colors.gray800};
  padding: ${spacings.xs} ${spacings.md};

  div {
    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.test-id {
      font-weight: 500;
      color: ${colors.gray900};
    }

    &.test-date {
      color: ${colors.gray600};
      font-size: 11px;
      padding-bottom: ${spacings.xs};
    }

    &.test-response {
      padding-top: ${spacings.xs};
      border-top: 1px solid ${colors.gray200};
      color: ${colors.gray700};
      font-size: 11px;
    }
  }
`;

export const DailyTestsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(30, 1fr);
  gap: 8px;
  height: 80px;
  margin: ${spacings.md} 0 ${spacings.xl} 0;
  width: 100%;

  @media (max-width: 768px) {
    gap: 2px;
  }
`;

export const DayColumn = styled.div`
  position: relative;
  height: 100%;
  min-width: 4px;
  background: ${colors.gray100};
  border-radius: ${borderRadius.lg};
  overflow: hidden;
`;

export const TestSegment = styled.div<{
  $status: 'success' | 'failed' | 'pending' | 'inactive';
  $height: number;
  $offset: number;
  $isLast: boolean;
  $isHovering?: boolean;
  $isPending?: boolean;
}>`
  position: absolute;
  bottom: ${({ $offset }) => $offset}%;
  left: 0;
  width: 100%;
  height: ${({ $height }) => $height}%;
  background-color: ${({ $status }) =>
    $status === 'success'
      ? colors.green600
      : $status === 'failed'
        ? colors.red600
        : $status === 'pending'
          ? colors.gray700
          : colors.gray100};
  box-sizing: border-box;
  border-top: ${({ $isLast }) =>
    $isLast ? 'none' : '1px solid ' + colors.white};
  transition: opacity 0.2s ease-in-out;
  cursor: pointer;

  &:hover {
    opacity: 0.8;
  }
`;

export const NoTestsMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${colors.gray500};
  font-style: italic;
`;

export const NotificationTypesContainer = styled.div`
  display: flex;
  gap: 4px;
  margin-top: 8px;
  flex-wrap: wrap;
`;

export const NotificationStats = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

export const NotificationStat = styled.div`
  flex: 1;

  .label {
    font-size: 12px;
    color: ${colors.gray600};
    margin-bottom: 2px;
  }

  .value {
    font-size: 14px;
    font-weight: bold;
    color: ${colors.gray900};
  }
`;

export const NotificationType = styled.div`
  background: ${colors.gray100};
  padding: 2px 6px;
  border-radius: ${borderRadius.sm};
  font-size: 11px;
  color: ${colors.gray700};
  text-transform: capitalize;
  height: 20px;
  display: flex;
  align-items: center;
  line-height: 1;
`;

export const FormSubmitWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const FormSubmitStatus = styled.div<{
  $status: 'success' | 'failed' | 'pending';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $status }) =>
    $status === 'success'
      ? 'rgba(34, 197, 94, 0.2)'
      : $status === 'failed'
        ? 'rgba(239, 68, 68, 0.2)'
        : 'rgba(55, 65, 81, 0.2)'};
  color: ${({ $status }) =>
    $status === 'success'
      ? colors.green600
      : $status === 'failed'
        ? colors.red600
        : colors.gray700};
  margin-right: ${spacings.sm};
`;

export const DurationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border-radius: ${borderRadius.sm};
  background-color: ${colors.gray100};
  color: ${colors.gray700};
  font-size: 9px;
  font-weight: 500;
  cursor: pointer;
  margin-right: ${spacings.sm};
  height: 16px;
  line-height: 1;
  position: relative;
  top: -1px;
`;

export const ScreenshotButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: #3f4d5a;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  opacity: 0.9;
  transition: all 0.2s ease;
  margin-right: ${spacings.sm};

  &:hover {
    opacity: 1;
    background: #4a5a6a;
  }

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
  }
`;

export const PendingStatus = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(55, 65, 81, 0.2);
  color: ${colors.gray700};
`;

export const StatusIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    display: block;
    margin: auto;
  }
`;

export const StatusText = styled.span`
  font-size: 13px;
  font-weight: 500;
`;

export const SubmissionDurationChartContainer = styled.div`
  padding: ${spacings.lg};
  background: ${colors.white};
  border-radius: ${borderRadius.lg};
  overflow-x: auto;
  ${scrollBar};

  h4 {
    font-size: 1.1em;
    margin-bottom: ${spacings.md};
    color: ${colors.gray800};
  }
`;

export const ChartTooltip = styled.div`
  background: ${colors.white};
  border: 1px solid ${colors.gray200};
  border-radius: ${borderRadius.md};
  padding: ${spacings.sm};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-size: 12px;

  p {
    margin: 0 0 4px 0;

    &:first-child {
      font-weight: 600;
      color: ${colors.gray900};
    }
  }

  .test-list {
    max-height: 100px;
    overflow-y: auto;
    margin-top: ${spacings.xs};

    .test-item {
      font-size: 11px;
      margin: 2px 0;
      color: ${colors.gray700};
    }
  }
`;

export const ChartWrapper = styled.div`
  width: 1800px;
  min-width: 100%;
`;

// Chart-specific tooltip styling
export const ChartTestTooltip = styled.div`
  overflow: hidden;
  min-width: 160px;
  background: ${colors.white};
  border-radius: ${borderRadius.md};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ChartTestTooltipHeader = styled.div`
  padding: ${spacings.xs} ${spacings.md};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ChartTestTooltipContent = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: ${colors.gray800};
  padding: ${spacings.xs} ${spacings.md};
  text-align: center;

  div {
    &:not(:last-child) {
      margin-bottom: 4px;
    }

    &.test-id {
      font-weight: 500;
      color: ${colors.gray900};
    }

    &.test-date {
      color: ${colors.gray600};
      font-size: 11px;
      padding-bottom: ${spacings.xs};
    }

    &.test-duration {
      padding-top: ${spacings.xs};
      border-top: 1px solid ${colors.gray200};
      color: ${colors.gray700};
      font-size: 11px;
    }
  }
`;
