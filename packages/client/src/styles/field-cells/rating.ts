import { css } from 'styled-components';

export const RatingCell = css`
  .ff-rating {
    display: flex;
    justify-content: flex-start;
    flex-wrap: wrap;

    > span {
      display: block;
      cursor: pointer;

      font-size: 200%;
      font-weight: 100;
      font-family: sans-serif;

      &:after {
        content: '★ ';
      }

      &:last-child {
        margin: 0 0 5px;
      }
    }
  }
`;
