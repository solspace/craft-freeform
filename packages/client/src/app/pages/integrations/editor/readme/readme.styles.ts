import { scrollBar } from '@ff-client/styles/mixins';
import { colors } from '@ff-client/styles/variables';
import styled from 'styled-components';

export const MarkdownToggler = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;

  color: ${colors.blue500};
  font-weight: 600;

  svg {
    width: 14px;
    height: 14px;

    transition: transform 0.3s ease;
  }

  &:hover {
    color: var(--blue-600);
    text-decoration: underline;
  }

  &.active {
    svg {
      transform: rotate(90deg);
    }
  }
`;

export const MarkdownCollapser = styled.button`
  position: absolute;
  right: 15px;
  top: 15px;

  opacity: 0;
  padding: 5px 10px;

  border: 1px solid var(--gray-300);
  border-radius: 30px;
  background: transparent;

  font-size: 12px;
  line-height: 12px;
  color: var(--gray-300);

  transition: all 0.3s ease;

  &:hover {
    background: var(--gray-300);
    color: white;
  }
`;

export const Instructions = styled.div`
  position: relative;

  max-height: 0;
  margin-top: 0;

  background: #f3f7fc;
  border-radius: 3px;
  border: 1px solid #cbd6e2;

  overflow-y: auto;
  opacity: 0;
  transition: all 0.3s ease-out;

  ${scrollBar};

  &.active {
    margin-top: 20px;
    max-height: 500px;

    opacity: 1;
    overflow: auto;

    .markdown-collapse {
      opacity: 1;
    }
  }
`;

export const Content = styled.div`
  padding: 16px;

  font-size: 14px;

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
