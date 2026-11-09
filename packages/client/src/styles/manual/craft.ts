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
    --tagify-dd-bg-color: var(--modal-bg);
    --tagify-dd-color-primary: var(--bg-selection-dark);
    color: var(--text-color);
    border-color: var(--hairline-color);
    box-shadow: var(--modal-shadow);
  }
  :root[data-dark-mode="dark"] .ff-token-dropdown .tagify__dropdown__wrapper { border-color: var(--hairline-color); }
  :root[data-dark-mode="dark"] .ff-token-dropdown .tagify__dropdown__item--active { color: var(--text-color); }

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
