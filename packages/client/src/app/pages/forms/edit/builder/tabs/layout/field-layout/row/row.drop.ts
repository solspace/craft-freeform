import type { DragItem } from "@editor/builder/types/drag";
import { Drag } from "@editor/builder/types/drag";
import type { Row } from "@editor/builder/types/layout";
import { useAppDispatch, useAppStore } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import { canPlaceField } from "@editor/store/thunks/fields/containers";
import type { ConnectDropTarget } from "react-dnd";
import { useDrop } from "react-dnd";
import { sectionDragPresentation } from "../field/section-drag";

type RowDropHook = {
  ref: ConnectDropTarget;
  isOver: boolean;
  canDrop: boolean;
  sectionHeight: number;
  sectionLabel: string;
  sectionPreview: string;
};

type CollectedProps = Omit<RowDropHook, "ref">;

export const useRowDrop = (row: Row): RowDropHook => {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  const [
    { isOver, canDrop, sectionHeight, sectionLabel, sectionPreview },
    ref,
  ] = useDrop<DragItem, void, CollectedProps>(
    () => ({
      accept: [Drag.FieldType, Drag.Field],
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }) && monitor.canDrop(),
        canDrop: monitor.canDrop(),
        ...sectionDragPresentation(monitor.getItem()),
      }),
      canDrop: (item, monitor) =>
        monitor.isOver({ shallow: true }) &&
        !!row.layoutUid &&
        (item.type === Drag.Field || item.type === Drag.FieldType) &&
        canPlaceField(store.getState(), item.data, row.layoutUid),
      drop: (item) => {
        if (item.type === Drag.Field) {
          dispatch(
            fieldThunks.move.existingField.newRow({
              layoutUid: row.layoutUid,
              field: item.data,
              order: row.order,
            }),
          );
        }

        if (item.type === Drag.FieldType) {
          dispatch(
            fieldThunks.move.newField.newRow({
              fieldType: item.data,
              row,
            }),
          );
        }
      },
    }),
    [row],
  );

  return {
    ref,
    isOver,
    canDrop,
    sectionHeight,
    sectionLabel,
    sectionPreview,
  };
};
