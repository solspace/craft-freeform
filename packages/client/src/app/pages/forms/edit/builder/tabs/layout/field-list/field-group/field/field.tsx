import type React from "react";
import { useCallback } from "react";
import type { ConnectDragSource } from "react-dnd";

import { Icon, Name, Wrapper } from "./field.styles";

type Props = {
  icon: string;
  label: string;
  dragRef?: ConnectDragSource;
  onClick?: () => void;
};

export const Field: React.FC<Props> = ({ icon, label, dragRef, onClick }) => {
  const connectDrag = useCallback(
    (element: HTMLDivElement | null) => {
      dragRef?.(element);
    },
    [dragRef],
  );
  return (
    <Wrapper
      ref={connectDrag}
      onClick={onClick}
      title={label}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
    >
      <Icon dangerouslySetInnerHTML={{ __html: icon }} />
      <Name dangerouslySetInnerHTML={{ __html: label }} />
    </Wrapper>
  );
};
