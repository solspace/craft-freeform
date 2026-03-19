import { useHover } from "@ff-client/hooks/use-hover";
import DeleteIcon from "@ff-icons/actions/trash-can";
import type React from "react";
import { useRef } from "react";

import { useRemoveAnimation } from "./remove.animations";
import { RemoveButtonWrapper } from "./remove.styles";

type Props = {
  active: boolean;
  onClick?: () => void;
};

export const RemoveButton: React.FC<
  Props & React.ComponentProps<typeof RemoveButtonWrapper>
> = ({ active, onClick, ...rest }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const hovering = useHover(ref);

  const animation = useRemoveAnimation({ active, hovering });
  const style = { ...animation, ...rest?.style };

  delete rest.style;

  return (
    <RemoveButtonWrapper
      ref={ref}
      style={style}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      {...rest}
    >
      <DeleteIcon />
    </RemoveButtonWrapper>
  );
};
