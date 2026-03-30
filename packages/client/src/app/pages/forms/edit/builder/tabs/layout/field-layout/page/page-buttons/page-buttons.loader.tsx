import { colors } from "@ff-client/styles/variables";
import type React from "react";
import Skeleton from "react-loading-skeleton";

import { Button, ButtonGroup, ButtonGroupWrapper } from "./page-buttons.styles";

export const LoaderPageButtons: React.FC = () => {
  return (
    <ButtonGroupWrapper>
      <ButtonGroup />
      <ButtonGroup>
        <Button className="btn btn-submit">
          <Skeleton width={50} baseColor={colors.gray400} />
        </Button>
      </ButtonGroup>
    </ButtonGroupWrapper>
  );
};
