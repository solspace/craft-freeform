import { createGlobalStyle } from "styled-components";

const style = createGlobalStyle`
  /* These control roles are absent in Craft 5 Light as well as Craft 4.
     CSS variables in both light-dark() branches must resolve. */
  :root:not([data-dark-mode="dark"]) {
    --ui-control-height: 34px;
    --ui-control-bg-color: var(--gray-100);
    --ui-control-hover-bg-color: var(--gray-200);
    --ui-control-active-bg-color: var(--gray-300);
    --ui-control-selected-bg: var(--gray-500);
    --ui-control-selected-color: var(--white);
  }

  /* Craft 4 has no appearance setting or semantic control tokens. Both
     light-dark() branches must resolve, even when only Light is displayed. */
  :root:not([data-dark-mode]) {
    --pane-bg: var(--white);
    --secondary-pane-bg: var(--gray-050);
    --modal-bg: var(--white);
    --input-bg: var(--white);
    --input-border-color: rgba(96, 125, 159, .25);
    --button-bg: var(--gray-100);
    --button-bg--hover: var(--gray-200);
    --button-border: none;
    --focus-ring-inner: inset 0 0 0 2px var(--blue-700);
    --focus-ring-light: var(--focus-ring);
    --bg-selection-light: #e8f0fc;
    --bg-selection-dark: #d8e7fb;
    --border-light: var(--hairline-color);
    --border-color: var(--gray-200);
    --bg-color: var(--white);
    --bg-enabled: rgba(32, 160, 123, .15);
    --bg-success: #e1f1e7;
    --fg-success: #246344;
    --border-success: #a7cdb7;
    --bg-error: #fff0f0;
    --fg-error: var(--error-color);
    --border-error: #e5a5a5;
    --bg-warning: #fff5db;
    --fg-warning: #8f6400;
    --border-warning: #d4b56a;
    --pane-shadow: 0 1px 3px rgba(0, 0, 0, .1);
    --modal-shadow: 0 4px 20px rgba(0, 0, 0, .2);
  }

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
