import styled from "styled-components";

export const TriggerButton = styled.button`
  z-index: 3 !important;

  &:after {
    margin-left: 0 !important;
  }
`;

export const PopupMenu = styled.div`
  position: absolute;
  left: 0;
  top: 24px;
  z-index: 10;

  background: white;

  ul {
    li {
      margin: 0 !important;
    }
  }
`;

export const Crumb = styled.li`
  &.craft-4 {
    gap: var(--xs);

    #site-crumb {
      display: flex;
      flex-direction: row;
      align-items: center;
      flex-wrap: nowrap;
      gap: var(--xs);
    }

    ${PopupMenu} {
      padding: 0 14px;

      border-radius: 4px;
      box-shadow:
        0 0 0 1px rgba(31, 41, 51, 0.1),
        0 5px 20px rgba(31, 41, 51, 0.25);

      user-select: none;
      overflow: auto;
      z-index: 100;
    }

    ${TriggerButton} {
      width: 22px;
      height: 22px;

      padding: 0 !important;

      min-height: auto !important;
      z-index: 3 !important;

      ul {
        display: flex;
        flex-direction: column;

        li {
          &::after {
            display: none;
          }

          a:hover {
            color: var(--light-text-color) !important;
          }
        }
      }
    }

    .cp-icon,
    .cp-icon svg {
      height: 0.75em;
      width: 0.75em;
    }
  }
`;
