import { sidebarItem } from "@components/layout/sidebar/sidebar";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled, { css } from "styled-components";

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
`;

export const SectionLink = styled.button.attrs({ type: "button" })`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.sm} ${spacings.md};
  border-radius: ${borderRadius.lg};

  ${sidebarItem};
`;

export const SectionIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  svg { width: 100%; height: 100%; }
`;

export const SidebarSeperator = styled.div`
  border-bottom: 1px solid var(--c-color-neutral-border-quiet);
  margin-block: var(--c-spacing-lg);
  margin-inline: calc(-1 * var(--freeform-sidebar-padding-inline));
`;

export const SidebarMeta = styled.p`
  font-size: 0.75rem;
  color: light-dark(${colors.gray400}, ${colors.muted});
  padding: 0 ${spacings.md};
  margin: 0 0 ${spacings.xs};
`;

export const SidebarMetaUserLink = styled.a`
  color: light-dark(${colors.gray400}, ${colors.muted});
  text-decoration: ${(props) => (props.href ? "underline" : "none")};
  font-weight: ${(props) => (props.href ? 600 : 400)};

  ${({ href }) =>
    href &&
    css`
      &:hover {
        color: ${colors.gray500};
        text-decoration: none;
      }
    `}

  ${({ href }) =>
    !href &&
    css`
      &:hover {
        text-decoration: none;
        cursor: text;
      }
    `}
`;
