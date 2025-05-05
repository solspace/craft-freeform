import { colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ItemWrapper = styled.a`
  cursor: pointer;

  display: block;

  padding: 0 ${spacings.xl} 3px;
  font-size: 14px;

  text-decoration: none;

  &:hover {
    cursor: pointer;
    background-color: ${colors.gray050};
  }

  &.active {
    background-color: ${colors.gray100};

    &:hover {
      background-color: ${colors.gray200};
    }
  }
`;
