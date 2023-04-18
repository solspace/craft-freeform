import type { MutableRefObject } from 'react';
import { useEffect, useState } from 'react';
import type { ConnectDragSource } from 'react-dnd';
import { useDrop } from 'react-dnd';
import type { DragItem, PageDragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { pageActions } from '@editor/store/slices/layout/pages';
import { moveCellToPage } from '@editor/store/thunks/pages';

import { useDragContext } from '../../../drag.context';

type TabDrop = (
  currentPageUid: string,
  page: Page
) => { ref: ConnectDragSource; canDrop: boolean };

export const useTabDrop: TabDrop = (currentPageUid, page) => {
  const dispatch = useAppDispatch();

  const [{ canDrop }, ref] = useDrop<DragItem, unknown, { canDrop: boolean }>({
    accept: [Drag.Cell],
    canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
    collect: (monitor) => ({
      canDrop: monitor.canDrop() && currentPageUid !== page.uid,
    }),
    drop: (item) => {
      if (item.type === Drag.Cell) {
        dispatch(moveCellToPage(item.data, page));
      }
    },
  });

  return { ref, canDrop };
};

type TabPageCollectedProps = {
  canDrop: boolean;
  isOver: boolean;
  dragItemIndex?: number;
};

type TabPageDrop = <T extends HTMLElement>(
  containerRef: MutableRefObject<T>,
  page: Page,
  index: number
) => TabPageCollectedProps & {
  ref: ConnectDragSource;
};

export const useTabPageDrop: TabPageDrop = (containerRef, page, index) => {
  const dispatch = useAppDispatch();
  const { position, dragOn } = useDragContext();

  const [dimensions, setDimensions] = useState<DOMRect>();

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    setDimensions(containerRef.current.getBoundingClientRect());
  }, [containerRef]);

  const [{ dragItemIndex, canDrop, isOver }, ref] = useDrop<
    PageDragItem,
    unknown,
    TabPageCollectedProps
  >(
    {
      accept: [Drag.Page],
      canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
      collect: (monitor) => ({
        canDrop: monitor.canDrop(),
        isOver: monitor.isOver({ shallow: true }),
        dragItemIndex: monitor.getItem()?.index,
      }),
      hover: () => {
        if (position !== index) {
          dragOn(Drag.Page, index);
        }
      },
      drop: (item) => {
        dispatch(pageActions.moveTo({ uid: item.data.uid, order: index }));
      },
    },
    [dimensions, position]
  );

  return { ref, canDrop, isOver, dragItemIndex };
};
