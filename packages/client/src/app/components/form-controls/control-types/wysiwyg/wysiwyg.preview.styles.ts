import styled from "styled-components";

import { PreviewTable } from "../table/table.preview.styles";

export const Pre = styled.pre`
  font-size: 10px;
`;

export const PreviewContainer = styled(PreviewTable)`
  > div > :first-child { margin-top: 0; }
  > div > :last-child { margin-bottom: 0; }

  ul, ol {
    display: block;
    padding-inline-start: 1.5em;
    margin-block: 0.75em;
    list-style-position: outside;
  }
  ul { list-style-type: disc; }
  ol { list-style-type: decimal; }
  ul ul { list-style-type: circle; }
  ul ul ul { list-style-type: square; }
  li { display: list-item; }
  li > ul, li > ol { margin-block: 0.25em; }

  a {
    pointer-events: none;
  }
`;
