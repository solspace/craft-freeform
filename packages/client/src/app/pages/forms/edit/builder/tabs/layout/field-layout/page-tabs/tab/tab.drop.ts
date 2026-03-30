import type { DragItem } from "@editor/builder/types/drag";
import { Drag } from "@editor/builder/types/drag";
import type { Page } from "@editor/builder/types/layout";
import { useAppDispatch } from "@editor/store";
import { moveFieldToPage } from "@editor/store/thunks/pages";
import type { ConnectDragSource } from "react-dnd";
import { useDrop } from "react-dnd";

import { useDragContext } from "../../../drag.context";

type TabDrop = (
  currentPageUid: string,
  page: Page,
) => { ref: ConnectDragSource; canDrop: boolean };

export const useTabDrop: TabDrop = (currentPageUid, page) => {
  const dispatch = useAppDispatch();
  const { dragOff } = useDragContext();

  const [{ canDrop }, ref] = useDrop<DragItem, unknown, { canDrop: boolean }>({
    accept: [Drag.Field],
    canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
    collect: (monitor) => ({
      canDrop: monitor.canDrop() && currentPageUid !== page.uid,
    }),
    drop: (item) => {
      if (item.type === Drag.Field) {
        dispatch(moveFieldToPage(item.data, page));
        dragOff();
      }
    },
  });

  return { ref, canDrop };
};
