import { createGlobalStyle } from "styled-components";

const style = createGlobalStyle`
  /* Also cover portal controls mounted outside the Freeform pane. */
  :root {
  --pane-bg: var(--c-surface-default);
  --secondary-pane-bg: var(--c-surface-raised);
  --body-bg: var(--c-surface-sunken);
  --modal-bg: var(--c-modal-fill);
  --input-bg: var(--c-input-fill);
  --input-border-color: var(--c-input-border-color);
  --text-color: var(--c-text-default);
  --light-text-color: var(--c-text-quiet);
  --link-color: var(--c-text-link);
  --hairline-color: var(--c-color-neutral-border-quiet);
  --medium-hairline-color: var(--c-color-neutral-border-normal);
  --border-hairline: var(--c-color-neutral-border-quiet);
  --border-light: var(--c-color-neutral-border-quiet);
  --border-color: var(--c-color-neutral-border-normal);
  --ui-control-bg-color: var(--c-color-neutral-fill-normal);
  --ui-control-hover-bg-color: var(--c-color-neutral-fill-loud);
  --ui-control-active-bg-color: var(--c-color-neutral-fill-loud);
  --ui-control-selected-bg: var(--c-color-accent-fill-normal);
  --ui-control-selected-color: var(--c-color-accent-on-normal);
  --bg-selection-light: var(--c-color-accent-fill-quiet);
  --bg-selection-dark: var(--c-color-accent-fill-normal);
  --pane-shadow: var(--c-shadow-sm);
  --modal-shadow: var(--c-modal-shadow);
  --menu-shadow: var(--c-shadow-md);
  --freeform-panel-shadow: var(--c-shadow-md);
  --freeform-box-shadow: var(--c-shadow-sm);
  --gray-050: var(--c-surface-raised);
  --gray-100: var(--c-color-neutral-fill-normal);
  --gray-200: var(--c-color-neutral-border-normal);
  --gray-300: var(--c-text-quiet);
  --gray-350: var(--c-text-quiet);
  --gray-400: var(--c-text-quiet);
  --gray-500: var(--c-text-quiet);
  --gray-550: var(--c-text-quiet);
  --gray-600: var(--c-text-default);
  --gray-700: var(--c-text-default);
  --gray-800: var(--c-text-default);
  --gray-900: var(--c-text-default);
  --gray-1000: var(--c-text-default);
  --bg-color: var(--c-surface-default);
  --bg-enabled: var(--c-color-success-fill-quiet);
  --bg-success: var(--c-color-success-fill-quiet);
  --fg-success: var(--c-color-success-on-quiet);
  --border-success: var(--c-color-success-border-normal);
  --bg-error: var(--c-color-danger-fill-quiet);
  --fg-error: var(--c-color-danger-on-quiet);
  --border-error: var(--c-color-danger-border-normal);
  --bg-warning: var(--c-color-warning-fill-quiet);
  --fg-warning: var(--c-color-warning-on-quiet);
  --border-warning: var(--c-color-warning-border-normal);
    --ui-control-height: var(--c-size-control-md);
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
