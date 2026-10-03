import { sectionHeading } from "@ff-client/styles/craft6";
import { spacings } from "@ff-client/styles/variables";
import styled from "styled-components";

export const Label = styled.h2`
  ${sectionHeading}
  padding: 0;
`;

export const ConfigurationDescription = styled.div`
  margin-bottom: ${spacings.xl};

  .select {
    margin: 0 5px;

    &:first-child {
      margin-left: 0;
    }
  }

  &.short {
    .select:first-child {
      margin-left: 5px;
    }
  }
`;
