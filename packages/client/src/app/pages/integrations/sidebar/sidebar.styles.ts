import { SearchBar } from "@components/search/search.style";
import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const SidebarNavigation = styled.nav`
  grid-area: sidebar;
  position: sticky;
  inset-block-start: 0;
  align-self: start;
  display: flex;
  flex-direction: column;
  width: 250px;
  max-height: calc(100dvh - var(--cp-header-height) - 16px);
  min-height: 0;
  padding: 0;
  box-sizing: border-box;
  background: var(--c-surface-default);
  border-inline-end: 1px solid var(--c-color-border-quiet);

  @media (max-width: 1023px) {
    position: static;
    width: 100%;
    max-height: 18rem;
    border-inline-end: 0;
    border-block-end: 1px solid var(--c-color-border-quiet);
  }
`;

export const SearchWrapper = styled.div`
  padding: 8px;
  border-bottom: 1px solid var(--c-color-border-quiet);

  ${SearchBar} {
    min-height: 34px;
    border: 1px solid var(--c-form-control-border-color);
    background: var(--c-surface-default);

    &::placeholder {
      font-style: normal;
      color: var(--c-text-quiet);
    }
  }
`;

export const CategoryList = styled.ul`
  list-style: none;
  padding: 8px;
  margin: 0;
  min-height: 0;
  overflow-y: auto;
  ${scrollBar};
`;

export const Category = styled.li`
  margin: 0 0 16px;
`;

export const CategoryTitle = styled.h3`
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  padding: 8px;
  margin: 0;
  color: var(--c-text-default);
`;

export const IntegrationList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const StatusIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border-radius: 50%;
  border: 1px solid var(--c-color-neutral-border-loud);
  color: var(--c-text-quiet);
  font-size: 9px;
  font-weight: 700;
  line-height: 1;

  &.active {
    border-color: transparent;
    background: var(--c-color-success-fill-loud);
    color: var(--c-color-success-on-loud);
  }

  &.unsupported {
    border-style: dashed;
  }
`;

export const Integration = styled.li`
  > a {
    display: flex;
    gap: 6px;
    align-items: center;
    min-height: 30px;
    box-sizing: border-box;
    padding: 4px 8px;
    margin: 0;
    font-size: 14px;
    line-height: 20px;
    color: var(--c-text-default);
    text-decoration: none;
    border: 1px solid transparent;
    border-radius: var(--c-radius-sm);

    &.unsupported {
      color: var(--c-text-quiet);
    }

    &:hover {
      background: var(--c-color-neutral-fill-quiet);
    }

    &.active {
      background: var(--c-color-accent-fill-quiet);
      border-color: var(--c-color-accent-fill-loud);
      color: var(--c-color-accent-on-quiet);
    }

    &:focus-visible {
      outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
      outline-offset: var(--c-focus-outline-offset);
    }
  }
`;

export const IntegrationTitle = styled.span`
  min-width: 0;
  overflow-wrap: anywhere;
`;

export const Icon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 16px;
  width: 16px;
  height: 16px;

  svg, i {
    width: 16px;
    height: 16px;
    font-size: 16px;
    line-height: 1;
  }
`;

export const Version = styled.span`
  flex-shrink: 0;
  font-size: 10px;
  color: var(--c-text-quiet);
  margin-inline-start: auto;
`;
