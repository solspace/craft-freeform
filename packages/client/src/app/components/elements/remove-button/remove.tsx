import DeleteIcon from "@ff-icons/actions/trash-can";
import type React from "react";

import { useRemoveAnimation } from "./remove.animations";
import { RemoveButtonWrapper } from "./remove.styles";

type Props = {
  active: boolean;
  onClick?: () => void;
};

export const RemoveButton: React.FC<
  Props & React.ComponentProps<typeof RemoveButtonWrapper>
> = ({ active, onClick, ...rest }) => {
  const animation = useRemoveAnimation({ active });
  const style = { ...animation, ...rest?.style };

  delete rest.style;

  return (
    <RemoveButtonWrapper
      type="button"
      style={style}
      onClick={onClick}
      {...rest}
    >
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
