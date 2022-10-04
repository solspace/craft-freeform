import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TabWrapper = styled.nav`
  position: relative;

  display: grid;
  grid-template-columns: 300px auto min-content;
  align-items: center;

  height: 50px;
  flex: 0 0 50px;

  box-sizing: border-box;
  overflow-x: hidden;

  background: ${colors.gray050};
  box-shadow: inset 0 -1px 0 0 rgb(154 165 177 / 25%);
`;

export const Heading = styled.h1`
  margin: 0;
  padding: 0 ${spacings.lg};
`;

export const TabsWrapper = styled.div`
  display: flex;
  align-self: flex-end;

  a {
    display: flex;
    align-items: center;

    height: 42px;
    padding: 0 12px;

    white-space: nowrap;

    color: var(--light-text-color);
    border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

    &:hover {
      text-decoration: none;
      background-color: rgba(154, 165, 177, 0.15);
    }

    &.active {
      background: ${colors.white};

      box-shadow: 0 0 0 1px ${colors.gray200}, 0 2px 12px rgb(205 216 228 / 50%) !important;

      color: ${colors.gray700};
    }
  }
`;

export const SaveButtonWrapper = styled.div`
  padding: 0 ${spacings.lg};
`;

export const SaveButton = styled.button.attrs({ className: 'btn submit' })``;
