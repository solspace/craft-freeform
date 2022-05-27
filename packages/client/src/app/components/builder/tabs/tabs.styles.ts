import styled from 'styled-components';

export const Wrapper = styled.nav`
  display: flex;
  gap: 10px;

  min-height: 50px;
  padding: var(--s) var(--padding) 0;

  box-sizing: border-box;
  overflow-x: hidden;

  background: var(--gray-050);
  border-radius: var(--large-border-radius) var(--large-border-radius) 0 0;
  box-shadow: inset 0 -1px 0 0 rgb(154 165 177 / 25%);

  a {
    display: flex;
    align-items: center;

    height: 42px;
    padding: 0 12px;

    white-space: nowrap;

    color: var(--light-text-color);
    border-radius: var(--medium-border-radius) var(--medium-border-radius) 0 0;

    &:hover {
      text-decoration: none;
      background-color: rgba(154, 165, 177, 0.15);
    }

    &.active {
      background: #fff;

      box-shadow: 0 0 0 1px #cdd8e4, 0 2px 12px rgb(205 216 228 / 50%) !important;

      color: var(--text-color);
    }
  }
`;
