import { scrollBar } from "@ff-client/styles/mixins";
import styled from "styled-components";

export const MarkdownWrapper = styled.div`
  margin: 0 -16px;
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
  padding: 16px;

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

  pre {
    background: #d1ddea;
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
`;
