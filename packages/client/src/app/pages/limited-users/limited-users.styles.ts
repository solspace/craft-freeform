import { LightSwitchWrapper } from "@components/elements/lightswitch/lightswitch.styles";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ContentContainer = styled.div`
  min-width: 0;

  &.craft-4 {
    max-width: calc(100% - 250px) !important;
    width: calc(100% - 250px) !important;
  }
`;

export const MainContainer = styled.div`
  width: auto !important;
  max-width: 100%;
  min-width: 0;
`;

export const GroupWrapper = styled.div`
  background-color: light-dark(white, var(--pane-bg, #fff));
  padding: ${spacings.xl};
  border-radius: 5px;
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
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 16px;

  align-self: center;
`;

export const Block = styled.div`
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  grid-template-areas: 'control label';

  gap: 8px;

  padding: 0 0 10px;

  &.solo {
    display: flex;
    padding-bottom: 16px;
  }

  &.triage {
    grid-template-areas:
      'control label'
      'control control-area';
    padding-bottom: 0;
  }
`;

export const Label = styled.label`
  grid-area: label;
`;

export const Heading = styled.h2`
  margin: 0;
  padding: 0;
`;

export const Control = styled.div`
  grid-area: control;
  display: flex;
  align-items: center;

  > ${LightSwitchWrapper} {
    flex-shrink: 0;
    transform: scale(0.85);
    transform-origin: left center;
  }
`;

export const ControlArea = styled.div`
  grid-area: control-area;
  min-width: 0;
  container: permission-options / inline-size;
`;

export const ToggleList = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 24px;

  @container permission-options (max-width: 920px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @container permission-options (max-width: 660px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @container permission-options (max-width: 420px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

export const ToggleListItem = styled.li`
  display: flex;
  min-width: 0;
  border-bottom: 1px solid ${colors.hairline};
`;

export const ToggleButton = styled.button`
  --permission-accent: var(--bg-enabled, var(--enabled-color));

  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  box-sizing: border-box;
  width: 100%;
  min-height: 34px;
  padding: 6px 4px;
  border: 1px solid transparent;
  border-radius: 0;
  background-color: transparent;
  color: ${colors.gray700};
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  text-align: start;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.15s ease;

  > span:first-child {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  &:hover {
    background-color: ${colors.gray050};
  }

  &:focus-visible {
    outline: 2px solid ${colors.blue600};
    outline-offset: 2px;
  }

  &[aria-checked='true']:hover {
    background-color: light-dark(color-mix(in srgb, var(--permission-accent) 6%, white), color-mix(in srgb, var(--permission-accent) 6%, var(--pane-bg, white)));
  }
`;

export const ToggleIndicator = styled.span`
  display: flex;
  align-items: center;
  flex: 0 0 24px;
  box-sizing: border-box;
  width: 24px;
  height: 16px;
  margin-top: calc((1.5em - 16px) / 2);

  > ${LightSwitchWrapper} {
    flex-shrink: 0;
    transform: scale(0.7);
    transform-origin: left center;
  }

  @media (prefers-reduced-motion: reduce) {
    > ${LightSwitchWrapper}, > ${LightSwitchWrapper} > div {
      transition: none;
    }
  }
`;

export const Actions = styled.div`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  line-height: 1.5;

  button {
    cursor: pointer;
    position: relative;
    padding: 2px 8px;
    border: 0;
    border-radius: 3px;
    background: transparent;
    color: ${colors.gray500};
    font: inherit;
    transition: color 0.15s ease;

    &:first-child {
      padding-inline-start: 0;
    }

    &:hover:not(:disabled) {
      color: ${colors.blue600};
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid ${colors.blue600};
      outline-offset: 2px;
    }

    &:disabled {
      color: light-dark(${colors.gray400}, ${colors.muted});
      opacity: 0.6;
      cursor: default;
    }

    &:not(:last-child):after {
      position: absolute;
      inset-inline-end: 0;
      top: 50%;
      transform: translateY(-50%);

      content: '';

      display: block;
      width: 1px;
      height: 12px;

      background-color: ${colors.gray200};
      font-size: 0;
      line-height: 0;
      overflow: hidden;
    }
  }
`;

export const List = styled.ul`
  transition: opacity 0.2s ease-out;
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
  position: relative;

  &[data-disabled] {
    opacity: 0.5;
    pointer-events: none;
  }

  &[data-type='group'][data-nesting='0']:not(:first-child) {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid ${colors.gray100};
  }

  &[data-type='toggles'] {
    &:not(:last-child) {
      margin-bottom: 24px;
    }

    > ${Block} > ${TitleBlock} > ${Label},
    > ${ChildrenCollapse} > ${ChildrenViewport} > ${Block} > ${TitleBlock} > ${Label} {
      color: ${colors.gray700};
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
    }
  }

  &[data-type='group'][data-id='props'] > ${List} {
    margin-inline-start: 24px;

    > li[data-type='toggles'] {
      transition: margin-bottom 320ms cubic-bezier(0.22, 1, 0.36, 1);

      &:not(:last-child) {
        margin-bottom: 28px;
      }

      &[data-collapsed='true'] {
        margin-bottom: 0;
      }

      > ${Block}, > ${ChildrenCollapse} > ${ChildrenViewport} > ${Block} {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas:
          'label'
          'control-area';
        row-gap: 6px;

        > ${Control} {
          display: none;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }
  }

  &[data-type='boolean'] > ${ChildrenCollapse} > ${ChildrenViewport} > ${List} {
    margin-inline-start: 24px;

    &:has(> li[data-type='toggles']) {
      padding-bottom: 16px;
    }
  }

  &[data-type='group'][data-nesting='1'] {
    margin-top: 16px;

    > ${Block} ${Heading} {
      margin-inline-start: 40px;
    }

    > ${List} {
      margin-inline-start: 24px;
    }
  }
`;
