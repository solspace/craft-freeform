import type React from "react";
import Skeleton from "react-loading-skeleton";

import { Button, ButtonGroup, ButtonGroupWrapper } from "./page-buttons.styles";

export const LoaderPageButtons: React.FC = () => {
  return (
    <ButtonGroupWrapper>
      <ButtonGroup />
      <ButtonGroup>
        <Button className="ff-page-button">
          <Skeleton width={50} />
        </Button>
      </ButtonGroup>
    </ButtonGroupWrapper>
  );
};
