import { scrollBar } from "@ff-client/styles/mixins";
import { borderRadius, colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const SidebarNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0;

  flex-basis: 250px;
  flex-shrink: 0;
  width: 300px;
  padding: 0;
  box-sizing: border-box;

  border-radius: ${borderRadius.lg} 0 0 ${borderRadius.lg};
  background: ${colors.gray050};
  box-shadow: inset -1px 0 0 0 rgb(154 165 177 / 25%);
`;

export const SearchWrapper = styled.div`
  padding: 22px ${spacings.md};
  border-bottom: 1px solid ${colors.hairline};
`;

export const CategoryList = styled.ul`
  list-style: none;
  padding: ${spacings.lg} ${spacings.sm} 0;
  margin: 0;

  overflow-y: auto;
  ${scrollBar};
`;

export const Category = styled.li`
  margin: 0 0 ${spacings.xl};
`;

export const CategoryTitle = styled.h3`
  font-weight: bold;
  padding: 0 ${spacings.lg} 0;
  margin: 0 0 ${spacings.sm};
`;

export const IntegrationList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  list-style: none;
  padding: 0 8px;
  margin: 0;
`;

export const StatusIndicator = styled.span`
  display: block;

  width: 12px;
  height: 12px;

  border-radius: 50%;
  border: 2px solid light-dark(${colors.gray300}, ${colors.muted});

  color: light-dark(${colors.gray300}, ${colors.muted});
  font-size: 10px;
  font-weight: bold;
  line-height: 8px;
  text-align: center;

  &.active {
    border-color: transparent;
    background-color: ${colors.teal500};
    color: light-dark(${colors.white}, ${colors.surface});
  }

  &.unsupported {
    border-style: dashed;
    border-width: 2px;
    border-color: ${colors.muted};
    color: light-dark(${colors.gray300}, ${colors.muted});
  }
`;

export const Integration = styled.li`
  > a {
    display: flex;
    gap: 5px;
    align-items: center;

    padding: 3px 10px;
    margin: 0;

    color: ${colors.gray700};
    text-decoration: none;
    border-radius: 4px;

    &.unsupported {
      opacity: 0.5;
    }

    &:hover,
    &.active {
      cursor: pointer;
      color: light-dark(${colors.white}, var(--text-color));

    }

    &:hover {
      background: light-dark(${colors.gray300}, var(--ui-control-hover-bg-color));

      .ff-integration-version { color: inherit; opacity: 0.8; }

      ${StatusIndicator} {
        &:not(.active) {
          border-color: ${colors.text};
        }

        &.active {
          background-color: ${colors.teal600};
        }
      }
    }

    &.active {
      background: light-dark(${colors.gray500}, var(--ui-control-selected-bg, var(--gray-500)));
      color: var(--ui-control-selected-color, #fff);

      &:hover {
        ${StatusIndicator} {
          &:not(.active) {
            border-color: currentColor;
          }

          &.active {
            background-color: ${colors.teal300};
          }
        }
      }

      .ff-integration-version { color: inherit; opacity: 0.8; }

      ${StatusIndicator} {
        &:not(.active) { border-color: currentColor; color: inherit; }
        &.active {
          background-color: ${colors.teal500};
          color: light-dark(${colors.gray700}, ${colors.surface});
        }
      }
    }
  }
`;

export const IntegrationTitle = styled.span``;

export const Icon = styled.span`
  svg,
  i {
    width: 16px;
    height: 16px;
    font-size: 16px;
    line-height: 16px;

    vertical-align: middle;
  }
`;

export const Version = styled.span.attrs({
  className: "ff-integration-version",
})`
  font-size: 10px;
  color: light-dark(${colors.gray300}, ${colors.muted});
  margin-left: auto;
`;
