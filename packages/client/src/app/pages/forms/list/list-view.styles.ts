import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const PageLayout = styled.div`
  min-width: 0;
  padding-block-start: var(--c-spacing-lg);
`;

export const HeaderContainer = styled.div`
  container-type: inline-size;
`;

export const Header = styled.header`
  --forms-control-height: var(--ui-control-height, 34px);

  display: grid;
  grid-template-areas: 'title views button';
  grid-template-columns: min-content minmax(0, 1fr) auto;
  justify-content: space-between;
  align-items: center;
  gap: ${spacings.lg} ${spacings.sm};
  margin-bottom: var(--c-spacing-xl);

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: var(--forms-control-height);
    gap: var(--c-spacing-sm);
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: var(--c-radius-md);
    background: var(--c-color-neutral-fill-quiet);
    color: var(--c-color-neutral-on-quiet);
    &:hover:not(:disabled):not(.active) { background: var(--c-color-neutral-fill-normal); }
    &:focus-visible {
      outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
      outline-offset: var(--c-focus-outline-offset);
    }
    &.submit {
      background: var(--c-color-accent-fill-loud);
      color: var(--c-color-accent-on-loud);
      &:hover:not(:disabled) { background: color-mix(in oklab, var(--c-color-accent-fill-loud), var(--c-color-mix-hover)); }
    }
  }

  && .btngroup > .btn.active {
    background: var(--c-color-neutral-fill-loud);
    border-color: var(--c-color-neutral-border-loud);
    color: var(--c-color-neutral-on-loud);
  }


  @container (max-width: 680px) {
    grid-template-areas: 'title button' 'views views';
    grid-template-columns: 1fr auto;
  }
  @container (max-width: 600px) {
    --forms-control-height: 44px;

    grid-template-columns: minmax(0, 1fr) auto;
  }
`;

export const Title = styled.h1`
  grid-area: title;

  padding: 0;
  margin: 0;

  font-size: var(--c-text-xl);
  font-weight: 700;
  line-height: 34px;
`;

export const ButtonGroup = styled.div`
  grid-area: button;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: ${spacings.sm};
`;

export const Button = styled.button`
  flex-shrink: 0;
`;

export const ViewButtons = styled.section`
  display: inline-flex;
  flex-shrink: 0;

  .btn {
    min-width: var(--forms-control-height);
    padding-inline: 10px;
  }

`;

export const ViewControls = styled.div`
  grid-area: views;
  display: flex;
  flex-wrap: wrap;
  min-width: 0;
  align-items: center;
  justify-content: flex-end;
  gap: ${spacings.sm};

  @container (max-width: 680px) {
    justify-content: flex-start;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  flex: 0 1 320px;
  width: 320px;
  min-width: 0;
  max-width: 320px;

  input.cp-form-control[type='search'] {
    padding-inline: 32px;
    box-sizing: border-box;
    height: var(--forms-control-height);
    min-height: var(--forms-control-height);
    padding: 0 32px;
  }

  input::placeholder {
    color: var(--light-text-color, #596673);
  }

  .texticon-icon {
    position: absolute;
    inset-inline-start: 10px;
    margin: 0;
    pointer-events: none;
  }


  .texticon-icon,
  .clear-btn {
    top: 50%;
    transform: translateY(-50%);
  }

  input[type='search']::-webkit-search-cancel-button {
    -webkit-appearance: none;
  }

  @container (max-width: 600px) {
    flex-basis: 100%;
    width: 100%;
    max-width: none;

    input[type='search'] {
      font-size: 16px;
    }
  }
`;

export const PeriodControlHost = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  &:empty { display: none; }
`;

export const ToolbarMenuTrigger = styled.button`
  gap: 8px;
  white-space: nowrap;
  height: var(--forms-control-height);
  > svg { display: block; width: 12px; height: 12px; flex-shrink: 0; }
`;

export const ToolbarMenu = styled.div.attrs({
  className: "menu menu--disclosure visible",
})`
  z-index: 1100;
  box-sizing: border-box;
  width: 240px;
  max-width: calc(100vw - 24px);
  font-size: var(--c-text-base);
  line-height: var(--c-leading-normal);

  ul { margin: 0; padding: 0; list-style: none; }
`;

export const ToolbarMenuItem = styled.button.attrs({
  className: "menu-item flex",
})`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  width: 100%;

  &:hover:not(:disabled) {
    background: var(--c-color-neutral-fill-quiet);
    color: var(--c-color-neutral-on-quiet);
  }
  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: calc(-1 * var(--c-focus-outline-width));
  }
  @media (pointer: coarse) { min-height: 44px; }
`;
