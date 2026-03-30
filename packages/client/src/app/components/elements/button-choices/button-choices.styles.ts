import { scrollBar } from "@ff-client/styles/mixins";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const ButtonGroupWrapper = styled.div`
  position: relative;
`;

export const ChoiceWrapper = styled.div`
  position: absolute;
  z-index: 1000;
  left: 0;
  top: 0;

  display: flex;
  flex-direction: column;
  gap: 0;

  width: 300px;
  max-height: 300px;
  padding: 0;
  overflow-y: auto;

  background-color: white;
  border: 0px solid #ccc;
  border-radius: 4px;
  box-shadow:
    0 0 0 1px rgba(31, 41, 51, 0.1),
    0 5px 20px rgba(31, 41, 51, 0.25);

  ${scrollBar};

  > ul {
    > li {
      > a {
        cursor: pointer;
        display: block;

        padding: ${spacings.sm} ${spacings.xl};
        color: ${colors.link};

        &:hover {
          background-color: ${colors.gray050};
          color: ${colors.gray700};

          text-decoration: underline;
        }
      }
    }
  }
`;
