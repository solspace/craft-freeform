import type React from "react";
import type { ConnectDragSource } from "react-dnd";

import { Icon, Name, Wrapper } from "./field.styles";

type Props = {
  icon: string;
  label: string;
  dragRef?: ConnectDragSource;
  onClick?: () => void;
};

export const Field: React.FC<Props> = ({ icon, label, dragRef, onClick }) => {
  return (
    <Wrapper
      ref={(el) => {
        if (dragRef) {
          dragRef(el);
        }
      }}
      onClick={onClick}
      title={label}
    >
      <Icon dangerouslySetInnerHTML={{ __html: icon }} />
      <Name dangerouslySetInnerHTML={{ __html: label }} />
    </Wrapper>
  );
};
