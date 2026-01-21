import { css } from 'styled-components';

export const StripeCell = css`
  .stripe-demo {
    display: flex;
    flex-direction: column;
    gap: 10px;

    > ul {
      display: flex;
      gap: 10px;
      justify-content: space-between;
      align-items: stretch;

      > li {
        flex: 1;
        padding: 0.75rem;

        border: 1px solid #e6e6e6;
        border-radius: 5px;
        background-color: white;

        &.selected {
          border-color: #0570de;
          fill: #0570de;
          color: #0570de;

          box-shadow:
            0px 1px 1px rgba(0, 0, 0, 0.03),
            0px 3px 6px rgba(0, 0, 0, 0.02),
            0 0 0 1px #0570de;
        }

        &:not(.selected) {
          filter: blur(3px);
        }

        .icon-container {
          display: block;

          & svg,
          & img {
            height: 1.2em;
          }
        }
      }
    }

    > div {
      display: grid;
      gap: 10px;
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-areas:
        'cc-number expiry cvc'
        'country country country';

      .cc-number {
        grid-area: cc-number;
      }

      .expiry {
        grid-area: expiry;
      }

      .cvc {
        grid-area: cvc;
      }

      .country {
        grid-area: country;
      }
    }
  }
`;
