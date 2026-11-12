import { SearchBar, SearchKeyHelper } from "@components/search/search.style";
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

  @media (max-width: 1023px) {
    position: static;
    width: 100%;
    max-height: 18rem;
    border-block-end: 1px solid var(--c-color-border-quiet);
  }
`;

export const SearchWrapper = styled.div`
  padding: var(--c-spacing-md);
  border-bottom: 1px solid var(--c-color-border-quiet);

  ${SearchBar} {
    box-sizing: border-box;
    height: var(--c-size-control-md);
    min-height: var(--c-size-control-md);
    border: 1px solid var(--c-form-control-border-color);
    background: var(--c-surface-default);

    &::placeholder {
      font-style: normal;
      color: var(--c-text-quiet);
    }
  }

  ${SearchKeyHelper} {
    top: 50%;
    transform: translateY(-50%);
    padding-block: var(--c-spacing-xs);
    line-height: 1;
  }
`;

export const CategoryList = styled.ul`
  list-style: none;
  padding: var(--c-spacing-md);
  margin: 0;
  min-height: 0;
  overflow-y: auto;
  ${scrollBar};
`;

export const Category = styled.li`
  margin: 0;
  padding: 0;
  & + & { margin-block-start: var(--c-spacing-lg); }
`;

export const CategoryTitle = styled.h3`
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  padding: var(--c-spacing-sm) var(--c-spacing-md);
  margin: 0 0 var(--c-spacing-xs);
  color: var(--c-text-default);
`;

export const IntegrationList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: var(--c-spacing-xs);
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
  margin: 0;
  padding: 0;
  > a {
    display: grid;
    grid-template-columns: 12px 16px minmax(0, 1fr) auto;
    gap: var(--c-spacing-md);
    align-items: center;
    min-height: var(--c-size-control-md);
    box-sizing: border-box;
    padding: var(--c-spacing-sm) var(--c-spacing-md);
    margin: 0;
    font-size: var(--c-text-base);
    line-height: var(--c-leading-normal);
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
  width: 16px;
  height: 16px;

  svg, i {
    display: block;
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
