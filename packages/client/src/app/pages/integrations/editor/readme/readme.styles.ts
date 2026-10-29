import { scrollBar } from "@ff-client/styles/mixins";
import { colors } from "@ff-client/styles/variables";
import styled from "styled-components";

export const MarkdownWrapper = styled.div`
  margin: 0 -24px;
  padding: 0 24px;

  background-color: #f3f7fc;

  border-top: 1px solid ${colors.hr};
`;

export const Instructions = styled.div`
  position: relative;

  margin: 0 -24px;
  padding: 0;

  max-height: 0;
  margin-top: 0;

  background-color: #f3f7fc;

  overflow-y: hidden;
  overflow-x: hidden;
  opacity: 0;
  transition: all 0.3s ease-out;

  ${scrollBar};

  &.active {
    max-height: 500px;

    border-bottom: 1px solid ${colors.hr};

    opacity: 1;
    overflow-y: auto;

    .markdown-collapse {
      opacity: 1;
    }
  }
`;

export const Content = styled.div`
  padding: 12px 24px;

  font-size: 14px;

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
    color: var(--gray-600, #515f6c);
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
    background: var(--white, #fff);
    color: var(--gray-600, #515f6c);
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
      outline: 2px solid #3476b8;
      outline-offset: 2px;
    }

    &[data-copied] {
      color: #226b45;
      border-color: #b6d3c2;
      background: #f0f7f3;
    }

    &:disabled {
      cursor: progress;
    }
  }

  .readme-copy-status {
    display: block;
    padding: 0 16px 12px;
    color: var(--gray-600, #515f6c);
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
    color: var(--gray-800, #33404d);
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
      color: #596b7c;
    }

    .property,
    .tag,
    .selector,
    .attr-name {
      color: #28639b;
    }

    .string,
    .attr-value,
    .char,
    .builtin {
      color: #226b45;
    }

    .keyword,
    .function,
    .class-name {
      color: #794395;
    }

    .number,
    .boolean,
    .constant,
    .variable {
      color: #8a4b16;
    }

    .operator,
    .entity,
    .url {
      color: #515f6c;
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
    color: #1f5fea;
    border: 1px solid #1f5fea;
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
    background: var(--white, #fff);

    > summary {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 44px;
      padding: 11px 14px;
      box-sizing: border-box;
      border-radius: 7px;
      background: #f8fafc;
      color: var(--gray-600, #515f6c);
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
        background: #edf2f8;
      }

      &:focus-visible {
        outline: 2px solid #3476b8;
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
      background: #edf2f8;

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
