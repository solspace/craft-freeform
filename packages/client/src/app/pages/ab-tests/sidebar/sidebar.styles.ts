import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const SidebarNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 0;

  flex-basis: 250px;
  flex-shrink: 0;
  width: 300px;
  padding: 0;
  box-sizing: border-box;

  border-radius: ${borderRadius.lg} 0 0 ${borderRadius.lg};
  background: ${colors.gray050};
  box-shadow: inset -1px 0 0 0 rgb(154 165 177 / 25%);
`;

export const TestList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 5px;

  list-style: none;
  padding: 24px 8px;
  margin: 0;
`;

export const Test = styled.li`
  > a {
    display: block;
    padding: 3px 10px;
    margin: 0;

    color: ${colors.gray700};
    text-decoration: none;
    border-radius: 4px;

    &.unsupported {
      opacity: 0.5;
    }

    &:hover,
    &.active {
      cursor: pointer;

      &,
      & span {
        color: ${colors.white};
      }
    }

    &:hover {
      background: ${colors.gray300};
    }

    &.active {
      background: ${colors.gray500};
    }
  }
`;

export const TestTitle = styled.span``;
export const TestDescription = styled.span`
  display: block;
  font-size: 12px;
  color: ${colors.gray600};
`;
