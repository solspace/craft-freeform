import React from 'react';
import { useDrop } from 'react-dnd';
import { useSelector } from 'react-redux';
import type { DragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { selectCurrentPage, setPage } from '@editor/store/slices/context';
import { moveCellToPage } from '@editor/store/thunks/pages';
import classes from '@ff-client/utils/classes';

import { TabWrapper } from './tab.styles';

export const Tab: React.FC<Page> = (page) => {
  const { uid } = useSelector(selectCurrentPage);
  const dispatch = useAppDispatch();

  const [{ canDrop }, ref] = useDrop<DragItem, unknown, { canDrop: boolean }>({
    accept: [Drag.Cell],
    canDrop: (_, monitor) => monitor.isOver({ shallow: true }),
    collect: (monitor) => ({
      canDrop: monitor.canDrop() && uid !== page.uid,
    }),
    drop: (item) => {
      if (item.type === Drag.Cell) {
        dispatch(moveCellToPage(item.data, page));
      }
    },
  });

  return (
    <TabWrapper
      ref={ref}
      className={classes(uid === page.uid && 'active', canDrop && 'can-drop')}
      onClick={(): void => {
        dispatch(setPage(page.uid));
      }}
    >
      {page.label}
    </TabWrapper>
  );
};
