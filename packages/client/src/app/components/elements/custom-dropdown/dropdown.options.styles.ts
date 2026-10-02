import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

const generatePadding = (level = 1): string => {
  if (level > 10) return "";

  return `& > li {
    > label {
      padding-left: ${level * 10 + 20}px;

      &.has-children {
        padding-left: ${(level + 1) * 12}px;
      }
    }

    > ul {
      ${generatePadding(level + 1)}
    }
  }`;
};

export const List = styled.ul`
  margin: 0;
  padding: 0;

  ul {
    ${generatePadding()}
  }
`;

export const CheckMark = styled.div`
  position: absolute;
  left: 8px;
  top: 7px;

  width: 16px;
  font-size: 18px;
  font-weight: bold;

  fill: currentColor;
`;

export const LabelIcon = styled.div``;

export const LabelContainer = styled.div`
  display: inline-flex;
  justify-content: start;
  align-items: center;
  gap: ${spacings.sm};

  > svg {
    width: 16px;
    height: 16px;
  }
`;

export const LabelValueDisplay = styled.div`
  color: var(--c-text-quiet);
  font-size: 11px;
  font-style: italic;
  line-height: 11px;
  height: 11px;
`;

export const Label = styled.label`
  display: block;
  min-height: var(--c-size-control-sm);
  padding: var(--c-spacing-sm) var(--c-spacing-md) var(--c-spacing-sm) 30px;
  border-radius: var(--c-radius-sm);
  margin-block: var(--c-spacing-xs);

  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: var(--c-color-neutral-fill-normal);
    color: var(--c-color-neutral-on-normal);

    ${CheckMark} {
      fill: currentColor;
    }
  }

  &.has-children {
    position: relative;

    padding-left: 12px;

    text-transform: uppercase;
    font-weight: bold;

    font-size: 12px;

    color: var(--c-text-quiet);
    fill: currentColor;

    > ${LabelContainer} {
      position: relative;

      padding: 0 10px;
      background-color: var(--c-surface-overlay);

      z-index: 1;
    }

    &:hover {
      cursor: default;
      background-color: transparent;
    }

    &:before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: 13px;

      height: 1px;
      background-color: var(--c-color-neutral-border-quiet);
    }
  }
`;

export const Item = styled.li`
  position: relative;

  &.focused,
  &.selected {
    > ${Label} {
      background-color: var(--c-color-neutral-fill-loud);
      color: var(--c-color-neutral-on-loud);

      > ${CheckMark} {
        fill: currentColor;
      }

      ${LabelValueDisplay} {
        color: inherit;
      }
    }
  }

  &.empty {
    > ${Label} {
      font-style: italic;
    }

    &:not(.focused):not(.selected) {
      > ${Label} {
        color: var(--c-text-quiet);

        &:hover {
          color: var(--c-color-neutral-on-normal);
        }
      }
    }
  }
`;
