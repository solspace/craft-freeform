import type React from "react";

import DeleteIcon from "./delete";
import { RemoveButtonWrapper } from "./remove.styles";

type Props = {
  onClick: () => void;
};

export const Remove: React.FC<Props> = ({ onClick }) => {
  return (
    <RemoveButtonWrapper type="button" onClick={onClick}>
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
