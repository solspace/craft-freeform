import translate from "@ff-client/utils/translations";
import type React from "react";
import styled from "styled-components";

import { Name, TemplateCard } from "./item.styles";

type Props = {
  onCreate?: () => void;
};

export const CreateButton: React.FC<Props> = ({ onCreate }) => {
  return (
    <TemplateCard className="dashed" onClick={onCreate}>
      <Name>
        <NameWrapper>
          <i className="fa-solid fa-plus" />
          {translate("Create New Template")}
        </NameWrapper>
      </Name>
    </TemplateCard>
  );
};

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
