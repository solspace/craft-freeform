import { sidebarItem } from "@components/layout/sidebar/sidebar";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

const iconSize = 20;
export const Icon = styled.div`
  display: block;
  width: ${iconSize}px;
  height: ${iconSize}px;
  font-size: ${iconSize}px;
  fill: currentColor;
`;

export const Link = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.sm} ${spacings.md};
  border-radius: ${borderRadius.lg};

  font-size: 12px;
  line-height: 12px;

  ${sidebarItem};
`;

export const Name = styled.div`
  flex-grow: 1;
  max-width: 90%;
  overflow: hidden;

  &:empty:after {
    content: 'No Title';
    color: ${colors.gray400};
    font-style: italic;
  }
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
    ${({ $enabled }): string => ($enabled ? "transparent" : colors.gray550)};
  border-radius: 100%;

  background-color: ${({ $enabled }): string =>
    $enabled ? colors.teal550 : "transparent"};

  transition: all 0.3s ease-out;
`;
