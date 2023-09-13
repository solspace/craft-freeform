import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Wrapper = styled.div`
  > a {
    display: flex;
    align-items: center;
    gap: ${spacings.sm};

    padding: ${spacings.sm} ${spacings.md};
    border-radius: ${borderRadius.lg};

    color: ${colors.gray700};
    font-size: 12px;
    line-height: 12px;

    transition: background-color 0.2s ease-out;
    text-decoration: none;

    &.active {
      color: ${colors.white};
      background-color: ${colors.gray500};
    }

    &.active.inactive {
      .status-dot {
        border-color: ${colors.white};
      }
    }

    &:hover:not(.active) {
      background-color: ${colors.gray200};
    }
  }
`;

export const Icon = styled.div`
  display: block;
  width: 20px;
  height: 20px;
`;

export const Name = styled.div`
  flex-grow: 1;
  max-width: 90%;

  padding: 1px 0;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type StatusProps = {
  $enabled?: boolean;
};

export const Status = styled.div<StatusProps>`
  content: '';

  flex-shrink: 0;
  justify-self: flex-end;

  width: 10px;
  height: 10px;

  border: 1px solid
    ${({ $enabled }): string => ($enabled ? 'transparent' : colors.gray550)};
  border-radius: 100%;

  background-color: ${({ $enabled: enabled }): string =>
    enabled ? colors.teal550 : 'transparent'};

  transition: all 0.3s ease-out;
`;
