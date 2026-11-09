import { colors, spacings } from "@ff-client/styles/variables";
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

  fill: ${colors.text};
`;

export const LabelIcon = styled.div``;

export const LabelContainer = styled.div`
  fill: currentColor;
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
  color: ${colors.muted};
  font-size: 11px;
  font-style: italic;
  line-height: 11px;
  height: 11px;
`;

export const Label = styled.label`
  display: block;
  padding: 5px 14px 5px 30px;

  user-select: none;

  &.has-status-color {
    padding-left: 12px;
    padding-right: 34px;

    ${CheckMark} {
      left: auto;
      right: 10px;
    }
  }

  &:hover {
    cursor: pointer;
    background-color: var(--ui-control-hover-bg-color);
    color: ${colors.gray700};

    ${CheckMark} {
      fill: ${colors.gray700};
    }
  }

  &.has-children {
    position: relative;

    padding: 10px 14px 4px;

    text-transform: uppercase;
    font-weight: bold;

    font-size: 12px;

    color: ${colors.muted};
    fill: currentColor;

    > ${LabelContainer} {
      position: relative;

      padding: 0;
      background-color: transparent;

      z-index: 1;
    }

    &:hover {
      cursor: default;
      background-color: transparent;
    }


  }
`;

export const Item = styled.li`
  position: relative;

  &.focused {
    > ${Label} {
      background-color: var(--ui-control-hover-bg-color);
      color: ${colors.gray700};

      > ${CheckMark} {
        fill: ${colors.gray700};
      }
    }
  }

  &.has-children {
    > ${Label} {
    }
  }

  &.empty {
    > ${Label} {
      color: ${colors.muted};
      font-style: italic;

      &:hover {
        color: ${colors.gray700};
      }
    }

    &.focused {
      > ${Label} {
        background-color: transparent;

        &:hover {
          background-color: var(--ui-control-hover-bg-color);
          color: ${colors.gray700};
        }

        > ${CheckMark} {
          fill: transparent;
        }
      }
    }
  }
`;
