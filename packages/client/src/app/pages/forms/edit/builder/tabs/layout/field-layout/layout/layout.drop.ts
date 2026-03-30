import type { DragItem } from "@editor/builder/types/drag";
import { Drag } from "@editor/builder/types/drag";
import type { Layout } from "@editor/builder/types/layout";
import { useAppDispatch } from "@editor/store";
import { fieldThunks } from "@editor/store/thunks/fields";
import type { PickAnimated, SpringValues } from "@react-spring/web";
import { useSpring } from "@react-spring/web";
import type { ConnectDropTarget } from "react-dnd";
import { useDrop } from "react-dnd";

type LayoutDropHook = {
  dropRef: ConnectDropTarget;
  placeholderAnimation: SpringValues<
    PickAnimated<{ opacity: number; transform: string }>
  >;
};

type CollectProps = {
  isOver: boolean;
};

export const useLayoutDrop = (layout: Layout): LayoutDropHook => {
  const dispatch = useAppDispatch();

  const [{ isOver }, dropRef] = useDrop<DragItem, void, CollectProps>(
    () => ({
      accept: [Drag.FieldType, Drag.Field],
      collect: (monitor) => ({ isOver: monitor.isOver({ shallow: true }) }),
      canDrop: (_item, monitor) => monitor.isOver({ shallow: true }),
      drop: (item) => {
        if (item.type === Drag.FieldType) {
          dispatch(
            fieldThunks.move.newField.newRow({
              fieldType: item.data,
              layoutUid: layout.uid,
            }),
          );
        }

        if (item.type === Drag.Field) {
          dispatch(
            fieldThunks.move.existingField.newRow({
              field: item.data,
              layoutUid: layout.uid,
            }),
          );
        }
      },
    }),
    [layout],
  );

  const placeholderAnimation = useSpring({
    to: {
      opacity: isOver ? 1 : 0,
      transform: isOver ? `scaleY(1)` : `scaleY(0)`,
    },
    config: {
      tension: 300,
    },
  });

  return {
    dropRef,
    placeholderAnimation,
  };
};
