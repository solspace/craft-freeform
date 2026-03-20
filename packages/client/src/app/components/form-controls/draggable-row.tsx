import { Row } from "@components/form-controls/control-types/table/table.editor.styles";
import { useRowDrag } from "@components/form-controls/hooks/use-row-drag";
import { useRowDrop } from "@components/form-controls/hooks/use-row-drop";
import classes from "@ff-client/utils/classes";
import type React from "react";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

type Props = {
  index: number;
  dragRef: RefObject<HTMLButtonElement>;
  onDrop: (fromIndex: number, toIndex: number) => void;
  children: React.ReactNode;
};

export const DraggableRow: React.FC<Props> = ({
  index,
  dragRef,
  onDrop,
  children,
}) => {
  const previewRef = useRef<HTMLTableRowElement>(null);

  const { handlerId, drop } = useRowDrop(index, previewRef, onDrop);
  const { isDragging, drag, preview } = useRowDrag(index);

  useEffect(() => {
    drag(dragRef);
  }, [drag, dragRef]);

  useEffect(() => {
    drop(preview(previewRef));
  }, [drop, preview]);

  return (
    <Row
      ref={previewRef}
      className={classes(isDragging && "dragging")}
      data-handler-id={handlerId}
    >
      {children}
    </Row>
  );
};
