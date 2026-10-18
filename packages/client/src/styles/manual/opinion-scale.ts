import { colors } from "@ff-client/styles/variables";
import { createGlobalStyle } from "styled-components";

const style = createGlobalStyle`
  .opinion-scale {
    pointer-events: none;
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .opinion-scale-scales {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      gap: 6px;
      align-items: stretch;

      > li {
        display: flex;
        flex-direction: column;
        min-width: 0;

        > label {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 1;
          min-height: 34px;
          padding: 6px 12px;
          margin: 0;
          border: 1px solid ${colors.inputBorder};
          border-radius: 3px;
          background: #fff;
          font-size: 13px;
          font-weight: 400;
          line-height: 20px;
          text-align: center;
          overflow-wrap: anywhere;
          color: ${colors.gray500};
          cursor: default;
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
            background: ${colors.gray100};
            border-color: ${colors.gray250};
            color: ${colors.gray700};
          }
        }
      }
    }

    ul.opinion-scale-legends {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(50px, 1fr));
      gap: 6px;
      margin-top: 6px;
      font-size: 12px;
      line-height: 18px;
      color: ${colors.gray400};

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
