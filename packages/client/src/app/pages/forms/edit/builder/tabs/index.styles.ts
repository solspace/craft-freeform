import { errorAlert } from '@ff-client/styles/mixins';
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
  position: relative;

  display: flex;
  align-items: center;
  gap: ${spacings.sm};

  margin: 0;
  padding: 0 ${spacings.lg};

  a {
    svg {
      position: relative;

      width: 18px;
      height: 18px;
      color: ${colors.gray200};

      transition: all 0.2s ease-out;
    }

    &:hover svg {
      color: ${colors.gray700};
      transform: translateX(-5px);
    }
  }
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
  padding: 0 ${spacings.lg};
`;

export const SaveButton = styled.button``;
