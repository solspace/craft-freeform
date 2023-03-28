import { NavLink } from 'react-router-dom';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${spacings.md};

  padding: ${spacings.sm};

  border-radius: ${borderRadius.lg};

  color: ${colors.gray700};
  font-size: 12px;
  line-height: 12px;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    background-color: ${colors.gray200};
  }

  &:hover:not(.active) {
    background-color: ${colors.gray100};
  }
`;

export const Name = styled.div`
  flex-grow: 1;
  padding-left: ${spacings.xl};
  overflow: hidden;
`;

type StatusProps = {
  enabled?: boolean;
};

export const Status = styled.div<StatusProps>`
  content: '';

  flex-shrink: 0;
  justify-self: flex-end;

  width: 10px;
  height: 10px;

  border: 1px solid
    ${({ enabled }): string => (enabled ? 'transparent' : colors.gray550)};
  border-radius: 100%;

  background-color: ${({ enabled }): string =>
    enabled ? colors.teal550 : 'transparent'};

  transition: all 0.3s ease-out;
`;
