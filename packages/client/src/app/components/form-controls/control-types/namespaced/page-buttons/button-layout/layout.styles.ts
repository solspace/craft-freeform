import styled from "styled-components";

export const AlignmentControl = styled.div`
  width: 100%;
  > [role="group"] { padding-top: 0; }
`;

export const OrderControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  margin-top: 16px;
  width: 100%;
`;

export const OrderLabel = styled.div`
  color: var(--c-text-default);
  font-size: 14px;
  font-weight: 700;
`;

export const ButtonLayoutWrapper = styled.div`
  display: grid;
  gap: 7px;
`;

export const ButtonGroup = styled.span`
  display: flex;
  gap: 3px;
  min-width: 0;
`;

// These are miniature previews, rather than interactive buttons inside a control.
export const Button = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  height: 25px;
  padding: 0 6px;
  box-sizing: border-box;
  border: 1px solid var(--c-form-control-border-color);
  border-radius: 4px;
  color: var(--c-text-default);
  background: var(--c-surface-default);
  font-size: 10px;
  font-weight: 400;
  line-height: 14px;

  svg { width: 12px; height: 12px; flex: 0 0 12px; }
  > span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
  &[data-kind='submit'] {
    border-color: var(--c-color-accent-border-normal);
    background: var(--c-color-accent-fill-loud);
    color: var(--c-color-accent-on-loud);
  }
`;

export const LayoutBlock = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin: 0;
  padding: 10px;
  border: 1px solid var(--c-form-control-border-color);
  border-radius: 6px;
  background: var(--c-surface-default);
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;

  .layout-preview {
    display: flex;
    flex: 1 1 auto;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
  }
  input { position: static; flex: 0 0 14px; width: 14px; height: 14px; box-sizing: border-box; margin: 0; appearance: none; border: 1px solid var(--c-form-control-border-color); border-radius: 50%; background: var(--c-input-fill);
    &:checked { border-color: var(--c-color-accent-fill-loud); background: radial-gradient(circle, var(--c-color-accent-fill-loud) 3px, var(--c-surface-default) 3.5px); box-shadow: none; } }
  &:hover:not(:has(input:checked)) { background: var(--c-color-neutral-fill-quiet); }
  &:has(input:checked) {
    border-color: var(--c-color-accent-border-normal);
    background: var(--c-color-accent-fill-quiet);
    color: var(--c-text-default);
    box-shadow: inset 0 0 0 1px var(--c-color-accent-border-normal);
  }
  &:has(input:focus-visible) { outline: 2px solid var(--c-color-focus-outline); outline-offset: 2px; }
`;
