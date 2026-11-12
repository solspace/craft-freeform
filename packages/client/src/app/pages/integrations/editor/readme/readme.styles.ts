import { scrollBar } from "@ff-client/styles/mixins";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const MarkdownWrapper = styled.div`
  margin: 0 -16px;
  margin-inline-start: calc(-1 * var(--freeform-integration-padding-start));
  padding: 0;

  background-color: var(--c-color-neutral-fill-quiet);

  border-top: 1px solid var(--c-color-border-quiet);
`;

export const Instructions = styled.div`
  position: relative;

  margin: 0;
  padding: 0;

  max-height: 0;
  margin-top: 0;

  background-color: var(--c-color-neutral-fill-quiet);

  overflow-y: hidden;
  overflow-x: hidden;
  opacity: 0;
  transition: all 0.3s ease-out;

  ${scrollBar};

  &.active {
    max-height: 500px;

    border-bottom: 1px solid var(--c-color-border-quiet);

    opacity: 1;
    overflow-y: auto;

    .markdown-collapse {
      opacity: 1;
    }
  }
`;

export const Content = styled.div`
  padding: var(--c-spacing-lg);
  padding-inline-start: var(--freeform-integration-padding-start);
  > :first-child { margin-block-start: 0; }
  > :last-child { margin-block-end: 0; }

  font-size: 14px;
  line-height: 1.5;
  color: var(--c-text-default);

  h1 {
    font-size: 20px;
    font-weight: 700;
    line-height: 28px;
  }

  h2 {
    font-size: 18px;
    font-weight: 700;
    line-height: 28px;
  }

  && .readme-code-block {
    margin-bottom: 16px;
    border: 1px solid var(--border-hairline, #cdd8e4);
    border-radius: var(--radius-md, 6px);
    background: var(--gray-050, #f3f7fc);
    overflow: hidden;

    pre {
      margin: 0;
      border: 0;
      border-top: 1px solid var(--border-hairline, #cdd8e4);
      border-radius: 0;
      background: transparent;
    }
  }

  .readme-code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 44px;
    padding: 8px 12px 8px 16px;
    box-sizing: border-box;
    color: light-dark(var(--gray-600, #515f6c), ${colors.muted});
    font-size: 11px;
    font-weight: 600;
    line-height: 16px;
  }

  .readme-copy {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 94px;
    min-height: 28px;
    padding: 4px 8px;
    box-sizing: border-box;
    border: 1px solid var(--gray-200, #cdd8e4);
    border-radius: var(--radius-sm, 4px);
    background: light-dark(var(--white, #fff), var(--pane-bg, #fff));
    color: light-dark(var(--gray-600, #515f6c), ${colors.muted});
    font: inherit;
    font-size: 12px;
    line-height: 18px;
    white-space: nowrap;
    cursor: pointer;

    svg {
      display: block;
      flex: 0 0 14px;
      width: 14px;
      height: 14px;
    }

    &:hover {
      background: var(--gray-100, #e4edf6);
    }

    &:focus-visible {
      outline: var(--focus-ring);
      outline-offset: 2px;
    }

    &[data-copied] {
      color: light-dark(#226b45, var(--fg-success));
      border-color: var(--border-success);
      background: light-dark(#f0f7f3, var(--bg-success));
    }

    &:disabled {
      cursor: progress;
    }
  }

  .readme-copy-status {
    display: block;
    padding: 0 16px 12px;
    color: light-dark(var(--gray-600, #515f6c), ${colors.muted});
    font-size: 12px;
    line-height: 18px;

    &:empty {
      display: none;
    }
  }

  && pre {
    padding: 16px;
    border: 1px solid var(--border-hairline, #cdd8e4);
    border-radius: var(--radius-md, 6px);
    background: var(--gray-050, #f3f7fc);
    color: light-dark(var(--gray-800, #33404d), ${colors.text});
    font-size: 13px;
    line-height: 1.6;

    code {
      border: 0;
      background: transparent;
      color: inherit;
      font-size: inherit !important;
    }

    .token {
      display: inline;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      box-shadow: none;
      font-size: inherit;
      line-height: inherit;
      text-shadow: none;
    }

    .comment,
    .prolog,
    .doctype,
    .cdata,
    .punctuation {
      color: light-dark(#596b7c, ${colors.muted});
    }

    .property,
    .tag,
    .selector,
    .attr-name {
      color: light-dark(#28639b, ${colors.link});
    }

    .string,
    .attr-value,
    .char,
    .builtin {
      color: light-dark(#226b45, var(--fg-success));
    }

    .keyword,
    .function,
    .class-name {
      color: light-dark(#794395, color-mix(in srgb, ${colors.text} 65%, #a855f7));
    }

    .number,
    .boolean,
    .constant,
    .variable {
      color: light-dark(#8a4b16, color-mix(in srgb, ${colors.text} 65%, #d97706));
    }

    .operator,
    .entity,
    .url {
      color: light-dark(#515f6c, ${colors.text});
    }
  }

  h3 {
    margin-bottom: 10px;
  }

  p {
    + ul,
    + ol {
      margin-top: -10px;
    }
  }

  ul,
  ol {
    padding-left: 20px;

    li {
      margin-top: 0.15em;

      > ul,
      > ol {
        margin-top: 0.15em;
      }
    }
  }

  ul {
    list-style: disc;
    ul {
      list-style: square;
      ul {
        list-style: circle;
        ul {
          list-style: disc;
          ul {
            list-style: square;
            ul {
              list-style: circle;
            }
          }
        }
      }
    }
  }

  ul li,
  ol li {
    .note {
      margin-top: 5px;
      margin-bottom: 5px;
    }
  }

  .note {
    display: block;
    padding: 7px 12px;
    border-radius: 5px;
  }

  .warning {
    border: 1px solid var(--warning-color);
  }

  .tip {
    color: light-dark(#1f5fea, ${colors.link});
    border: 1px solid light-dark(#1f5fea, ${colors.link});
  }

  .danger {
    color: var(--error-color);
    border: 1px solid var(--error-color);
  }

  hr {
    height: 1px;
  }

  && details {
    box-sizing: border-box;
    margin: 10px 0;
    border: 1px solid var(--gray-200, #cdd8e4);
    border-radius: 8px;
    background: light-dark(var(--white, #fff), var(--pane-bg, #fff));

    > summary {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 11px 14px;
      box-sizing: border-box;
      border-radius: 7px;
      background: light-dark(#f8fafc, var(--gray-050, #f8fafc));
      color: light-dark(var(--gray-600, #515f6c), ${colors.muted});
      font-weight: 600;
      line-height: 20px;
      list-style: none;
      cursor: pointer;
      transition: background-color 150ms ease;

      &::-webkit-details-marker {
        display: none;
      }

      &::before {
        content: "";
        flex: 0 0 6px;
        width: 6px;
        height: 6px;
        margin: 0 3px 0 1px;
        border-right: 2px solid currentColor;
        border-bottom: 2px solid currentColor;
        transform: rotate(-45deg);
        transition: transform 180ms ease;
      }

      &:hover {
        background: light-dark(#edf2f8, var(--ui-control-hover-bg-color, #edf2f8));
      }

      &:focus-visible {
        outline: var(--focus-ring);
        outline-offset: -2px;
      }
    }

    &[open] {
      padding-bottom: 16px;
    }

    &[open] > summary {
      border-bottom: 1px solid var(--gray-200, #cdd8e4);
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      background: light-dark(#edf2f8, var(--ui-control-hover-bg-color, #edf2f8));

      &::before {
        transform: rotate(45deg);
      }
    }

    &[data-closing] > summary::before {
      transform: rotate(-45deg);
    }

    > :not(summary) {
      margin-right: 16px;
      margin-left: 16px;
    }

    > summary + * {
      margin-top: 16px;
    }

    > :last-child:not(summary) {
      margin-bottom: 0;
    }

    @media (prefers-reduced-motion: reduce) {
      > summary,
      > summary::before {
        transition: none;
      }
    }
  }
`;
