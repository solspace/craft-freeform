import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const MonitorStatus = styled.span`
  display: inline-block;
  white-space: nowrap;
  align-items: center;
  border-radius: 3px;
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  color: #424d59;
`;

export const LastTestStatus = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 3px;
  font-size: 11px;
  color: #424d59;
  margin-bottom: 7px;
`;

export const StatsChartContainer = styled.div<{ $align?: 'left' | 'right' }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: ${({ $align = 'left' }) =>
    $align === 'right' ? 'flex-end' : 'flex-start'};
  text-align: ${({ $align = 'left' }) => $align};
`;

export const LineIndicator = styled.div<{ $width?: string }>`
  width: ${({ $width = '100%' }) => $width};
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(
    to right,
    #78db89 0%,
    #78db89 var(--success),
    #ec6d6b var(--success),
    #ec6d6b var(--failed),
    #bcc8d9 var(--failed),
    #bcc8d9 var(--pending),
    ${colors.gray300} var(--pending),
    ${colors.gray300} 100%
  );
`;

export const TestStatusIcon = styled.div<{
  $status: 'success' | 'failed' | 'pending';
  $size: 'sm' | 'lg';
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size = 'sm' }) => ($size === 'sm' ? '20px' : '24px')};
  height: ${({ $size = 'sm' }) => ($size === 'sm' ? '20px' : '24px')};
  color: ${({ $status }) => {
    switch ($status) {
      case 'success':
        return '#78db89';
      case 'failed':
        return '#ec6d6b';
      case 'pending':
        return '#bcc8d9';
      default:
        return '#bcc8d9';
    }
  }};

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
`;

export const ErrorMessage = styled.div<{ $withMargin?: boolean }>`
  color: ${colors.red600};
  font-size: 11px;
  line-height: 1.2;
  font-weight: 500;
  font-family: monospace;
  margin-top: ${({ $withMargin }) => ($withMargin ? '15px' : '0px')};
`;
