import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled, { css } from 'styled-components';

export const SectionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacings.xs};
`;

export const SectionLink = styled.button`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${spacings.sm};

  padding: ${spacings.sm} ${spacings.md};
  border-radius: ${borderRadius.lg};

  color: ${colors.gray700};
  fill: currentColor;

  transition: background-color 0.2s ease-out;
  text-decoration: none;

  &.active {
    color: ${colors.white};
    background-color: ${colors.gray500};
  }

  &.errors {
    color: ${colors.error};
  }

  &.active.errors {
    color: ${colors.white};
    background-color: ${colors.error};
  }

  &:hover:not(.active) {
    background-color: ${colors.gray100};
  }
`;

export const SectionIcon = styled.div`
  width: 18px;
  height: 18px;
`;

export const SidebarSeperator = styled.div`
  border-bottom: solid 1px ${colors.gray200};
  margin: ${spacings.lg} 0;
`;

export const SidebarMeta = styled.p`
  font-size: 0.75rem;
  color: ${colors.gray400};
  padding: 0 ${spacings.md};
  margin: 0 0 ${spacings.xs};
`;

export const SidebarMetaUserLink = styled.a`
  color: ${colors.gray400};
  text-decoration: ${(props) => (props.href ? 'underline' : 'none')};
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
