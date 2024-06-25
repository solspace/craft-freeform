import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Item = styled.li`
  line-height: 1.4;
  list-style-type: disc;

  &.disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.restored {
    opacity: 0;
  }
`;

export const ItemTitle = styled.span`
  color: ${colors.blue600};
  font-weight: bold;
`;

export const ItemTitleLink = styled(ItemTitle)`
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export const ItemDate = styled.span`
  color: #868f96;
  margin-left: 5px;
`;

export const ItemMeta = styled.span`
  margin-left: 5px;
  color: ${colors.gray200};

  &::before {
    content: '|';
    padding-right: 5px;
  }

  a,
  button {
    cursor: pointer;
    color: var(--link-color);

    &:hover {
      text-decoration: underline;
    }
  }
`;
