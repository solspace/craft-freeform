import { errorAlert } from '@ff-client/styles/mixins';
import { borderRadius, colors, spacings } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const TabWrapper = styled.nav`
  position: relative;

  display: grid;
  grid-template-columns: 300px min-content auto;
  align-items: center;

  height: 50px;
  flex: 0 0 50px;

  box-sizing: border-box;
  overflow-x: hidden;
`;

export const Heading = styled.h1`
  position: relative;
  margin: 0;
`;

export const FormName = styled.span`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: ${colors.gray700};
`;

export const TabsWrapper = styled.div`
  display: flex;
  align-self: flex-end;

  background-color: ${colors.gray050};
  border-radius: ${borderRadius.lg} ${borderRadius.lg} 0 0;
  box-shadow:
    inset 0 -1px 0 0 rgba(154, 165, 177, 0.25),
    0 0 0 1px rgba(154, 165, 177, 0.25);

  a {
    display: flex;
    align-items: center;

    height: 49px;
    padding: 0 ${spacings.xl};

    white-space: nowrap;

    color: var(--light-text-color);
    border-radius: ${borderRadius.md} ${borderRadius.md} 0 0;

    &:hover {
      text-decoration: none;
      background-color: rgba(154, 165, 177, 0.15);

      &:not(.active) {
        &:not(:first-child) {
          border-top-left-radius: 0;
        }

        &:not(:last-child) {
          border-top-right-radius: 0;
        }
      }
    }

    &.active {
      background: ${colors.white};
      color: ${colors.gray700};
      box-shadow:
        inset 0 2px 0 ${colors.gray500},
        0 0 0 1px rgba(51, 64, 77, 0.1),
        0 2px 12px rgba(205, 216, 228, 0.5) !important;
    }

    &.errors {
      position: relative;
      color: ${colors.error};

      ${errorAlert};
    }

    > span[data-icon] {
      position: relative;
      left: 5px;
    }
  }
`;

export const SaveButtonWrapper = styled.div`
  display: flex;
  justify-content: end;
`;

export const SaveButton = styled.button``;
