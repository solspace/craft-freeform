import { css } from "styled-components";

// Restore content typography inside the control panel's reset styles.
export const contentPreview = css`
  line-height: 1.5;
  overflow-wrap: anywhere;

  && p, && blockquote, && pre, && table {
    margin-block: 1em;
  }

  && h1, && h2, && h3, && h4, && h5, && h6 {
    font-weight: bold;
    line-height: 1.25;
    margin-block: 1em 0.5em;
  }
  && h1 { font-size: 2em; }
  && h2 { font-size: 1.5em; }
  && h3 { font-size: 1.17em; }
  && h4 { font-size: 1em; }
  && h5 { font-size: 0.83em; }
  && h6 { font-size: 0.67em; }

  && ol, && ul {
    margin-block: 1em;
    padding-inline-start: 2.5em;
    list-style-position: outside;
  }
  && ol { list-style-type: decimal; }
  && ul { list-style-type: disc; }
  && li { display: list-item; }
  && li > ol, && li > ul { margin-block: 0.25em; }
  && > :first-child { margin-block-start: 0; }
  && > :last-child { margin-block-end: 0; }
`;
