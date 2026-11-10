import type React from "react";

import { useDuplicateAnimation } from "./duplicate.animations";
import DuplicateIcon from "./duplicate.icon";
import { DuplicateButtonWrapper } from "./duplicate.styles";

type Props = {
  active: boolean;
  onClick?: () => void;
};

export const DuplicateButton: React.FC<
  Props & React.ComponentProps<typeof DuplicateButtonWrapper>
> = ({ active, onClick, ...rest }) => {
  const animation = useDuplicateAnimation({ active });
  const style = { ...animation, ...rest?.style };

  delete rest.style;

  return (
    <DuplicateButtonWrapper
      type="button"
      style={style}
      onClick={onClick}
      {...rest}
    >
      <DuplicateIcon />
    </DuplicateButtonWrapper>
  );
};
