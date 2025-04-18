import { colors, spacings } from '@ff-client/styles/variables';
import styled, { css } from 'styled-components';

export const FormMonitorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.lg};
  padding: ${spacings.xl};
  background: ${colors.white};
  height: 100%;
  flex: 1;
`;

export const MonitorWrapper = styled.div`
  display: flex;
  flex-grow: 1;
  height: 100%;
`;

const sizeStyles = {
  sm: css`
    font-size: 10px;
    padding: 2px 6px;
    gap: 4px;
  `,
  md: css`
    font-size: 12px;
    padding: 2px 6px;
    gap: 6px;
  `,
  lg: css`
    font-size: 14px;
    padding: 2px 6px;
    gap: 8px;
  `,
  xl: css`
    font-size: 16px;
    padding: 6px 10px 6px 6px;
    gap: 6px;
    width: fit-content;
  `,
};

const dotSizeStyles = {
  sm: css`
    width: 8px;
    height: 8px;
  `,
  md: css`
    width: 10px;
    height: 10px;
  `,
  lg: css`
    width: 12px;
    height: 12px;
  `,
  xl: css`
    width: 20px;
    height: 20px;
  `,
};

export const StatusIndicator = styled.div<{
  $status:
    | 'success'
    | 'failed'
    | 'pending'
    | 'disabled'
    | 'active'
    | 'inactive';
  $size?: 'sm' | 'md' | 'lg' | 'xl';
}>`
  display: inline-flex;
  align-items: center;
  font-weight: 500;
  text-transform: uppercase;
  border-radius: 999px;
  ${({ $size = 'sm' }) => sizeStyles[$size]}
  background-color: ${({ $status }) => {
    switch ($status) {
      case 'success':
      case 'active':
        return 'rgba(34, 197, 94, 0.2)';
      case 'failed':
        return 'rgba(239, 68, 68, 0.2)';
      case 'pending':
        return 'rgba(55, 65, 81, 0.2)';
      case 'inactive':
        return 'rgba(107, 114, 128, 0.2)';
      default:
        return 'rgba(156, 163, 175, 0.2)';
    }
  }};
  color: ${({ $status }) => {
    switch ($status) {
      case 'success':
      case 'active':
        return colors.green600;
      case 'failed':
        return colors.red600;
      case 'pending':
        return colors.gray700;
      case 'inactive':
        return colors.gray600;
      default:
        return colors.gray600;
    }
  }};
`;

export const StatusDot = styled.span<{
  $size?: 'sm' | 'md' | 'lg' | 'xl';
  $status?:
    | 'success'
    | 'failed'
    | 'pending'
    | 'disabled'
    | 'active'
    | 'inactive';
}>`
  display: inline-block;
  border-radius: 50%;
  background-color: currentColor;
  position: relative;
  ${({ $size = 'sm' }) => dotSizeStyles[$size]}

  ${({ $status }) =>
    $status === 'pending' &&
    css`
      background-color: transparent;
      color: currentColor;

      svg {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100%;
        height: 100%;
        animation: spin 2s linear infinite;
      }

      @keyframes spin {
        from {
          transform: translate(-50%, -50%) rotate(0deg);
        }
        to {
          transform: translate(-50%, -50%) rotate(360deg);
        }
      }
    `}
`;
