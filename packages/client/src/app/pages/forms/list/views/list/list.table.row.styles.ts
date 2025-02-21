import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const MonitorStatus = styled.span`
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  color: ${colors.gray700};
`;

export const StatsChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
`;

export const LineWrapper = styled.div`
  position: relative;
  padding-bottom: 24px;
`;

export const LineIndicator = styled.div`
  width: 70%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    ${colors.teal500} 0%,
    ${colors.teal500} var(--success),
    ${colors.red500} var(--success),
    ${colors.red500} var(--failed),
    ${colors.yellow400} var(--failed),
    ${colors.yellow400} var(--pending),
    ${colors.gray300} var(--pending),
    ${colors.gray300} 100%
  );
`;
