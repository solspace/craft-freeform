import type { MutableRefObject } from 'react';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { selectCurrentPage, setPage } from '@editor/store/slices/context';
import classes from '@ff-client/utils/classes';

import { useDragContext } from '../../../drag.context';

import { useTabDrag } from './tab.drag';
import { useTabDragAnimation } from './tab.drag-animation';
import { useTabDrop, useTabPageDrop } from './tab.drop';
import { PageTab, TabDrop, TabWrapper } from './tab.styles';

type Props = {
  page: Page;
  index: number;
};

export const Tab: React.FC<Props> = ({ page, index }) => {
  const { uid } = useSelector(selectCurrentPage);
  const dispatch = useAppDispatch();
  const { dragType } = useDragContext();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const { canDrop, ref: dropRef } = useTabDrop(uid, page);
  const { isDragging, ref: dragRef } = useTabDrag(index, page);

  const { ref: dropPageRef, dragItemIndex } = useTabPageDrop(
    wrapperRef,
    page,
    index
  );

  const connectedRef = dropRef(
    dragRef(wrapperRef)
  ) as unknown as MutableRefObject<HTMLDivElement>;

  const style = useTabDragAnimation(
    wrapperRef,
    index,
    dragItemIndex,
    isDragging
  );

  return (
    <TabWrapper ref={connectedRef}>
      {(!!dragType || isDragging) && <TabDrop ref={dropPageRef} />}
      <PageTab
        className={classes(
          uid === page.uid && 'active',
          canDrop && 'can-drop',
          isDragging && 'is-dragging'
        )}
        style={style}
        onClick={(): void => {
          dispatch(setPage(page.uid));
        }}
      >
        {page.label}
      </PageTab>
    </TabWrapper>
  );
};
