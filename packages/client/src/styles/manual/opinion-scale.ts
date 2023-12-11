import { createGlobalStyle } from 'styled-components';

const borderColor = '#cccccc';
const radius = '3px';

const style = createGlobalStyle`
  .opinion-scale {
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .opinion-scale-scales {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      grid-gap: 0;

      > * {
        > label {
          display: block;
          padding: 6px 12px;
          margin: 0 0 5px;

          border: 1px solid ${borderColor};
          border-left: none;

          white-space: nowrap;
          text-align: center;
          color: black !important;
          cursor: pointer;
        }

        input {
          position: absolute;
          left: -9999px;
          top: -9999px;
          width: 1px;
          height: 1px;
          overflow: hidden;
          visibility: hidden;

          &:checked ~ label {
            background: #e6e6e6;
          }
        }

        &:first-child {
          > label {
            border-left: 1px solid ${borderColor};

            border-top-left-radius: ${radius};
            border-bottom-left-radius: ${radius};
          }
        }

        &:last-child {
          > label {
            border-top-right-radius: ${radius};
            border-bottom-right-radius: ${radius};
          }
        }
      }
    }

    ul.opinion-scale-legends {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      grid-gap: 0;

      li {
        text-align: center;
      }

      li:first-child {
        text-align: left;
      }

      li:last-child {
        text-align: right;
      }
    }
  }
`;

export default style;
