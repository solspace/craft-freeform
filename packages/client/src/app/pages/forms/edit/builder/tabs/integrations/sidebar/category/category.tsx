import type { IntegrationCategory } from "@ff-client/types/integrations";
import type React from "react";
import {
  IntegrationItemWrapper,
  Label,
  LabelWrapper,
  Wrapper,
} from "./category.styles";
import { Integration } from "./integration/integration";

export const Category: React.FC<IntegrationCategory> = ({
  label,
  children,
}) => {
  return (
    <Wrapper>
      <LabelWrapper>
        <Label>{label}</Label>
      </LabelWrapper>
      <IntegrationItemWrapper>
        {children.map((child) => (
          <Integration key={child.id} {...child} />
        ))}
      </IntegrationItemWrapper>
    </Wrapper>
  );
};
