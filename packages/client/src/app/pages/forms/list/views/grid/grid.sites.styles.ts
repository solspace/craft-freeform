import { borderRadius, colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const ButtonWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

export const Button = styled.button``;

export const DropdownWrapper = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 10;

  display: block;
`;

export const PopupMenu = styled.div`
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 100;

  padding: 0 14px;

  background: white;
  box-shadow:
    0 0 0 1px rgba(31, 41, 51, 0.1),
    0 5px 20px rgba(31, 41, 51, 0.25);

  border-radius: ${borderRadius.lg};

  overflow: auto;
  user-select: none;

  ul {
    li {
      a {
        position: relative;
        cursor: pointer;

        display: block;
        margin: 0 -14px;
        padding: 10px 14px 10px 24px;

        color: ${colors.gray700};
        font-size: 14px;
        text-decoration: none;
        white-space: nowrap;

        &:hover {
          --text-color: var(--white);
          --light-text-color: var(--gray-100);
          --ui-control-color: var(--gray-050);
          --ui-control-hover-color: var(--gray-100);
          --ui-control-active-color: var(--gray-100);
          background-color: #606d7b;
          color: #fff;
        }

        &.sel {
          &:before {
            content: 'check';
            position: absolute;
            left: 7px;
            top: 11px;

            float: left;

            font-family: Craft;
            color: ${colors.gray400};
          }
        }
      }
    }
  }
`;
