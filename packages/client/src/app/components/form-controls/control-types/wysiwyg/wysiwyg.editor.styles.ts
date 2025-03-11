import styled from 'styled-components';

export const WysiwygEditorWrapper = styled.div`
  background: white;
  border: 1px solid #d9d9d9;

  .pell-actionbar {
    display: flex;
    justify-content: start;
  }

  .pell-content {
    cursor: text;

    a {
      cursor: text;
    }

    blockquote {
      border-left: 2px solid #d9d9d9;
      margin-left: 0;
      padding-left: 10px;
    }

    pre {
      border: 1px solid #d9d9d9;
      padding: 10px;
      white-space: pre-wrap;
      background-color: rgb(247, 247, 247);
    }

    ul {
      list-style-type: disc;
      padding-inline-start: 40px;
    }
  }

  button.pell-button {
    display: flex;
    justify-content: center;
    align-items: center;

    svg {
      width: 14px;
      height: 14px;
    }
  }
`;
