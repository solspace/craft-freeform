import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

const generatePadding = (level = 1): string => {
  if (level > 10) return '';

  return `& > li {
    > label {
      padding-left: ${level * 24}px;
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

export const Label = styled.label`
  display: block;
  padding: 5px 14px;

  user-select: none;

  &:hover {
    cursor: pointer;
    background-color: ${colors.gray200};
  }
`;

export const Item = styled.li`
  &.focused > ${Label} {
    background-color: ${colors.gray700};
    color: ${colors.gray100};
  }

  &.has-children {
    > ${Label} {
      font-weight: bold;
      font-size: 14px;
      font-style: italic;

      background-color: ${colors.gray100};

      &:hover {
        cursor: default;
        background-color: ${colors.gray100};
      }
    }
  }
`;
