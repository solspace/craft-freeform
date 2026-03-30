import { breakpoints } from "@ff-client/styles/breakpoints";
import { scrollBar } from "@ff-client/styles/mixins";
import { colors, spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const TemplateCategoryWrapper = styled.div``;

export const Title = styled.div`
  cursor: pointer;
  position: relative;

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${spacings.sm};

  padding: 0;
  margin: 0 0 ${spacings.sm};

  user-select: none;

  > span {
    padding: 0;

    color: ${colors.gray300};
    font-size: 13px;
    font-weight: bold;
    text-transform: uppercase;
    white-space: nowrap;
  }

  &:after {
    content: '';

    width: 100%;
    height: 1px;

    background-color: ${colors.gray200};
  }
`;

export const TemplateList = styled.ul`
  position: relative;

  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: ${spacings.sm};

  max-height: 130px;
  overflow-y: auto;

  ${scrollBar};

  &.has-scroll {
    padding-right: 10px;
  }

  ${breakpoints.desktop.sm} {
    grid-template-columns: repeat(2, 1fr);
  }

  ${breakpoints.desktop.md} {
    grid-template-columns: repeat(4, 1fr);
  }
`;
