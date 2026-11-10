import { dropdownControl } from "@ff-client/styles/craft6";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const GroupWrapper = styled.div`
  max-width: 1100px;
  padding-inline: var(--c-spacing-lg);
  color: var(--c-text-default);
`;

export const ProfileFields = styled.div`
  display: grid;
  gap: 24px;
  margin-block-end: 24px;

  .profile-field {
    margin: 0;
  }

  .heading label {
    font-weight: var(--font-weight-bold, 700);
  }

  .instructions {
    margin-block: 6px 8px;
    color: var(--c-text-quiet);
    font-size: var(--c-text-base);
    font-style: normal;
  }

  .cp-form-control {
    ${dropdownControl}
    width: 100%;
    padding: 6px 10px;
    max-width: 40rem;
  }

  textarea.cp-form-control {
    display: block;
    resize: vertical;
  }
`;

export const PresetSection = styled.section`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid ${colors.gray100};

  > p {
    margin: 4px 0 12px;
    color: ${colors.gray500};
    font-size: 13px;
    line-height: 1.5;
  }
`;

export const PresetHeader = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 16px;

  h2 {
    margin: 0;
    color: ${colors.gray700};
    font-size: 14px;
    font-weight: 600;
    line-height: 1.5;
  }
`;

export const PresetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 10px;
`;

export const PresetButton = styled.button`
  width: 100%;
  max-width: none;
  align-items: stretch;
  font: inherit;
  text-align: start;
  transition: border-color 0.15s ease, background-color 0.15s ease;

  && .choice-heading {
    flex-wrap: nowrap;
    padding-inline-end: 0;
  }

  &:hover:not(:disabled) {
    border-color: var(--choice-accent);
  }

  &[aria-pressed='true'], &[aria-pressed='true']:hover:not(:disabled) {
    border-color: var(--choice-accent);
    background: var(--choice-selected-background);
    box-shadow: inset 0 0 0 1px var(--choice-accent);

    .choice-heading {
      color: var(--choice-selected-heading);
    }

    .choice-icon {
      color: var(--choice-accent);
    }
  }

  &:focus-visible {
    outline: 2px solid var(--choice-accent);
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

export const PresetDescription = styled.span`
  color: ${colors.gray600};
  font-size: 12px;
  line-height: 1.5;
`;

export const TitleBlock = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  min-width: 0;
`;

export const Block = styled.div`
  display: grid;
  grid-template-columns: calc(var(--c-size-control-sm, 24px) * 2) minmax(0, 1fr);
  grid-template-areas: 'control label';
  align-items: center;
  gap: 8px 12px;
  padding-block: 6px;

  &.solo {
    display: block;
    padding-block: 0 12px;
  }

  &.triage {
    display: block;
    padding-block: 12px;

    ${TitleBlock} {
      margin-block-end: 8px;
    }
  }

  &.select-control {
    grid-template-columns: minmax(140px, 220px) minmax(0, 1fr);
  }

  @media (max-width: 600px) {
    &.select-control {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas: 'label' 'control';
    }
  }
`;

export const Label = styled.label`
  cursor: pointer;
  line-height: 1.5;
`;

export const Heading = styled.h2`
  margin: 0 !important;
  padding: 0;
  color: var(--c-text-default);
  font-size: var(--text-lg, 1.125rem);
  font-weight: var(--font-weight-bold, 700);
  line-height: var(--text-lg--line-height, 1.55556);
`;

export const Control = styled.div`
  grid-area: control;
  min-width: 0;

  .select,
  select {
    width: 100%;
  }
`;

export const PermissionSwitch = styled.button`
  position: relative;
  display: block;
  width: calc(var(--c-size-control-sm, 24px) * 2);
  height: var(--c-size-control-sm, 24px);
  padding: 0;
  border: var(--c-input-border-width) var(--c-input-border-style)
    var(--c-input-border-color);
  border-radius: var(--c-radius-full);
  background: var(--c-color-neutral-fill-quiet);
  box-shadow: var(--c-input-shadow);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    inset-block-start: 2px;
    inset-inline-start: 2px;
    width: calc(var(--c-size-control-sm, 24px) - 6px);
    height: calc(var(--c-size-control-sm, 24px) - 6px);
    border: 1px solid var(--c-input-border-color);
    border-radius: var(--c-radius-full);
    background: var(--c-surface-raised);
    box-sizing: border-box;
  }

  &[aria-checked='true'] {
    background: var(--c-color-accent-fill-loud);
    border-color: var(--c-color-accent-fill-loud);

    &::before {
      inset-inline-start: auto;
      inset-inline-end: 2px;
      border-color: var(--c-color-accent-border-loud);
    }
  }

  &:focus-visible {
    outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
    outline-offset: var(--c-focus-outline-offset);
  }

  > svg {
    position: absolute;
    inset-inline-end: 5px;
    inset-block-start: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    color: var(--c-color-accent-on-quiet);
    pointer-events: none;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const ControlArea = styled.div`
  min-width: 0;
`;

export const ToggleList = styled.ul`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 190px), 1fr));
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const ToggleListItem = styled.li`
  min-width: 0;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    box-sizing: border-box;
    padding: 6px 10px;
    border: 1px solid var(--c-color-neutral-border-quiet);
    border-radius: var(--c-radius-sm);
    background: var(--c-color-neutral-fill-quiet);
    color: var(--c-text-default);
    cursor: pointer;
    line-height: 1.5;

    &:hover {
      background: var(--c-color-neutral-fill-normal);
    }

    &:focus-within {
      outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
      outline-offset: var(--c-focus-outline-offset);
    }
  }

  input {
    flex-shrink: 0;
    margin: 0;
    accent-color: var(--c-color-accent-fill-loud);
  }

  &.selected label {
    border-color: var(--c-color-accent-border-quiet);
    background: var(--c-color-accent-fill-quiet);

    &:hover {
      background: var(--c-color-accent-fill-normal);
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;

  button {
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--c-text-link);
    cursor: pointer;
    font: inherit;
    font-size: var(--c-text-sm);
    line-height: 1.5;

    &:hover:not(:disabled) {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: var(--c-focus-outline-width) solid var(--c-color-focus-outline);
      outline-offset: var(--c-focus-outline-offset);
      border-radius: var(--c-radius-sm);
    }

    &:disabled {
      color: var(--c-text-quiet);
      opacity: 0.5;
      cursor: default;
    }
  }
`;

export const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const ChildrenViewport = styled.div`
  min-height: 0;
  overflow: hidden;
  margin-inline: -4px;
  padding-inline: 4px;
`;

export const ChildrenCollapse = styled.div<{ $expanded: boolean }>`
  display: grid;
  grid-template-rows: ${({ $expanded }) => ($expanded ? "1fr" : "0fr")};
  opacity: ${({ $expanded }) => ($expanded ? 1 : 0)};
  transition: grid-template-rows 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms ease;

  > ${ChildrenViewport} > ${List}, > ${ChildrenViewport} > ${Block} {
    transform: translateY(${({ $expanded }) => ($expanded ? "0" : "-6px")});
    transition: transform 360ms cubic-bezier(0.34, 1.45, 0.64, 1);
  }

  @media (prefers-reduced-motion: reduce) {
    &, > ${ChildrenViewport} > ${List}, > ${ChildrenViewport} > ${Block} {
      transition: none;
    }
  }
`;

export const ListItem = styled.li`
  &[data-disabled] > ${Block} {
    opacity: 0.5;
  }

  &[data-type='group'][data-nesting='0'] {
    border-block-start: 1px solid var(--c-color-neutral-border-quiet);
    padding-block: 24px;
  }

  &[data-type='group']:not([data-nesting='0']) {
    padding-block-start: 16px;

    ${Heading} {
      font-size: var(--c-text-base);
    }
  }

  &[data-type='boolean'] > ${List} {
    margin-block: 4px 8px;
    margin-inline-start: 24px;
    padding-inline-start: 16px;
    border-inline-start: 1px solid var(--c-color-neutral-border-quiet);
  }
`;
