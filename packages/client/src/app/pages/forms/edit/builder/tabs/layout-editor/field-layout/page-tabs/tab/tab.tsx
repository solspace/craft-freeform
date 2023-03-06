import type { KeyboardEvent, MutableRefObject } from 'react';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { selectCurrentPage, setPage } from '@editor/store/slices/context';
import { updateLabel } from '@editor/store/slices/pages';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import classes from '@ff-client/utils/classes';

import { useDragContext } from '../../../drag.context';

import { useTabDrag } from './tab.drag';
import { useTabDragAnimation } from './tab.drag-animation';
import { useTabDrop, useTabPageDrop } from './tab.drop';
import { Input, PageTab, TabDrop, TabWrapper } from './tab.styles';

type Props = {
  page: Page;
  index: number;
};

export const Tab: React.FC<Props> = ({ page, index }) => {
  const { uid } = useSelector(selectCurrentPage);
  const dispatch = useAppDispatch();
  const { dragType } = useDragContext();

  const wrapperRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);

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

  const handleKeyboardEvent = (
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === 'Enter') {
      dispatch(
        updateLabel({
          uid: page.uid,
          label: (event.target as HTMLInputElement).value || page.label,
        })
      );

      setIsEditing(false);
    }
  };

  const ref = useClickOutside<HTMLDivElement>(
    (): void => setIsEditing(false),
    isEditing
  );

  return (
    <TabWrapper ref={connectedRef}>
      {(!!dragType || isDragging) && <TabDrop ref={dropPageRef} />}
      <PageTab
        ref={ref}
        className={classes(
          uid === page.uid && 'active',
          canDrop && 'can-drop',
          isEditing && 'is-editing',
          isDragging && 'is-dragging'
        )}
        style={style}
        onClick={(): void => {
          setIsEditing(false);
          dispatch(setPage(page.uid));
        }}
        onDoubleClick={(): void => setIsEditing(true)}
      >
        {isEditing ? (
          <Input
            type="text"
            autoFocus={true}
            className="text small"
            placeholder={page.label}
            defaultValue={page.label}
            onKeyUp={handleKeyboardEvent}
          />
        ) : (
          page.label
        )}
      </PageTab>
    </TabWrapper>
  );
};
