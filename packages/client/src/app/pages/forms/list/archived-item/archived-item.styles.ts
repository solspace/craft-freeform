import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const Item = styled.li`
  line-height: 1.4;
  list-style-type: disc;
  vertical-align: center;
`;

export const ItemTitle = styled.span`
  color: ${colors.blue600};
  font-weight: bold;
`;

export const ItemTitleLink = styled(ItemTitle)`
  cursor: pointer;
`;

export const ItemDate = styled.span`
  color: #868f96;
  margin-left: 5px;
`;

export const ItemLink = styled.span`
  margin-left: 5px;
  color: ${colors.gray200};

  &::before {
    content: '|';
    padding-right: 5px;
  }

  a {
    color: var(--link-color);
  }
`;
