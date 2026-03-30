import { css } from "styled-components";

export const SquareCell = css`
  .square-demo {
    display: flex;
    flex-direction: column;
    gap: 10px;

    > div {
      display: grid;
      gap: 10px;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-areas: 'cc-number expiry cvc';

      .cc-number {
        grid-area: cc-number;
      }
      .expiry {
        grid-area: expiry;
      }
      .cvc {
        grid-area: cvc;
      }
    }
  }
`;
