import { createGlobalStyle } from "styled-components";

const style = createGlobalStyle`
  :root[data-dark-mode="dark"] {
    --freeform-panel-shadow: var(--modal-shadow);
    --freeform-box-shadow: var(--pane-shadow);
  }

  :root[data-dark-mode="dark"] #freeform-client .react-loading-skeleton {
    --base-color: var(--ui-control-bg-color);
    --highlight-color: var(--ui-control-hover-bg-color);
  }

  :root[data-dark-mode="dark"] .ff-token-dropdown {
    --tagify-dd-text-color: var(--text-color);
    --tagify-dd-bg-color: var(--gray-050);
    --tagify-dd-color-primary: var(--bg-selection-light);
    color: var(--text-color);
    border-color: var(--medium-hairline-color);
    box-shadow: var(--modal-shadow);
  }
  :root[data-dark-mode="dark"] .ff-token-dropdown .tagify__dropdown__wrapper { border-color: var(--medium-hairline-color); }
  :root[data-dark-mode="dark"] .ff-token-dropdown .tagify__dropdown__item--active { color: var(--text-color); }

  /* Freeform-owned tables, including portal editors. Authored tables do not
     receive this class. Keep input fills in step with their hovered row. */
  :root[data-dark-mode="dark"] body:not(.dragging) table.freeform-ui-table > tbody > tr:not(.sel, .selected, .disabled, .active-drop-target, [aria-selected="true"]):hover {
    --freeform-row-hover: color-mix(in srgb, var(--text-color) 3.5%, var(--pane-bg));
    > th, > td { background-color: var(--freeform-row-hover); }
    > td > input:not([type="checkbox"], [type="radio"], [type="color"], [type="range"]):not(:focus),
    > td > textarea:not(:focus) { background-color: var(--freeform-row-hover); }
  }

  #main-content {
    padding: 0;
  }

  footer#global-footer {
    display: none;
  }

  ul#crumb-list {
    li.crumb {
      > button {
        z-index: 2;
      }

      &:after {
        z-index: 1;
      }
    }
  }
`;

export default style;
