import styled from 'styled-components';

export const Overlay = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 100;

  background: rgba(123, 135, 147, 0.35);
  overflow: hidden;

  &.enter {
    opacity: 0;

    &-active {
      opacity: 1;
      transition: opacity 300ms ease-out;
    }
  }

  &.exit {
    opacity: 1;

    &-active {
      opacity: 0;
      transition: opacity 300ms ease-out;
    }
  }
`;

export const Wrapper = styled.div`
  position: absolute;
  left: 30%;
  right: 30%;
  top: 50%;
  z-index: 101;

  transform: translateY(-50%);

  display: flex;
  flex-direction: column;

  background: #ffffff;
  border-radius: 5px;
  box-shadow: 0 10px 100px rgb(0 0 0 / 50%);

  box-sizing: border-box;
`;

type GridProps = {
  columns: number;
};

export const Grid = styled.div<GridProps>`
  display: grid;
  grid-template-columns: repeat(${({ columns }): number => columns}, 1fr);
  gap: 24px;

  &:not(:last-child) {
    margin-bottom: 24px;
  }

  .field {
    margin: 0;
  }
`;

export const Content = styled.div`
  flex: 1 1;
  padding: 24px;
  border-radius: 5px 5px 0 0;
`;

export const Footer = styled.div`
  flex: 0 0;

  display: flex;
  flex-direction: row-reverse;
  gap: 5px;

  padding: 14px 24px;

  background: #e4edf6;
  border-radius: 0 0 5px 5px;
  box-shadow: inset 0 1px 0 rgb(51 64 77 / 10%);
`;

export const Button = styled.button``;
