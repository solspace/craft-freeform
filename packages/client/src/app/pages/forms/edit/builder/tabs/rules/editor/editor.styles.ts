import { sectionHeading } from "@ff-client/styles/craft6";
import styled from "styled-components";

export const Label = styled.h2`
  ${sectionHeading}
  padding: 0;
`;

export const ConfigurationDescription = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--c-spacing-md);
  margin-block: var(--c-spacing-md) var(--c-spacing-xl);
`;
