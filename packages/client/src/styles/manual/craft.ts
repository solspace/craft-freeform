import { createGlobalStyle } from "styled-components";

const style = createGlobalStyle`
  /* Only lay out our React breadcrumbs; Craft owns the surrounding header. */
  .cp-header-bar__breadcrumbs:has(> .freeform-breadcrumbs) {
    display: flex;
    align-items: center;
    gap: var(--c-spacing-md);
    min-width: 0;
  }

  .cp-header-bar__breadcrumbs > .freeform-breadcrumbs {
    min-width: 0;
    font-size: var(--text-xs, 0.75rem);

    ul {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--c-spacing-md);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: flex;
      align-items: center;
      gap: var(--c-spacing-md);

      &::before {
        content: '/';
        color: var(--c-text-quiet);
      }

      a {
        color: inherit;
        text-decoration: none;
      }
    }
  }

`;

export default style;
