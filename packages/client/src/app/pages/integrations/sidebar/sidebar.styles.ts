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
  border: 2px solid ${colors.gray300};

  color: ${colors.gray300};
  font-size: 10px;
  font-weight: bold;
  line-height: 8px;
  text-align: center;

  &.active {
    border-color: transparent;
    background-color: ${colors.teal500};
    color: ${colors.white};
  }

  &.unsupported {
    border-style: dashed;
    border-width: 2px;
    border-color: ${colors.gray200};
    color: ${colors.gray300};
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
      color: ${colors.white};

      svg,
      i {
        path:not([fill='none']) {
          fill: ${colors.gray100} !important;
          color: ${colors.gray100};

          &.inverted {
            fill: ${colors.gray700} !important;
            color: ${colors.gray700};
          }
        }
      }
    }

    &:hover {
      background: ${colors.gray300};

      ${StatusIndicator} {
        &:not(.active) {
          border-color: ${colors.gray500};
        }

        &.active {
          background-color: ${colors.teal600};
        }
      }
    }

    &.active {
      background: ${colors.gray500};

      &:hover {
        ${StatusIndicator} {
          &:not(.active) {
            border-color: ${colors.gray100};
          }

          &.active {
            background-color: ${colors.teal300};
          }
        }
      }

      ${StatusIndicator} {
        &.active {
          background-color: ${colors.teal500};
          color: ${colors.gray700};
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

export const Version = styled.span`
  font-size: 10px;
  color: ${colors.gray300};
  margin-left: auto;
`;
