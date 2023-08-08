import type { KeyboardEvent, MutableRefObject } from 'react';
import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import type { Page } from '@editor/builder/types/layout';
import { useAppDispatch } from '@editor/store';
import { contextActions } from '@editor/store/slices/context';
import { contextSelectors } from '@editor/store/slices/context/context.selectors';
import { pageActions } from '@editor/store/slices/layout/pages';
import { pageSelecors } from '@editor/store/slices/layout/pages/pages.selectors';
import { deletePage } from '@editor/store/thunks/pages';
import { useClickOutside } from '@ff-client/hooks/use-click-outside';
import classes from '@ff-client/utils/classes';
import translate from '@ff-client/utils/translations';

import { useDragContext } from '../../../drag.context';

import { useTabDrag } from './tab.drag';
import { useTabDragAnimation } from './tab.drag-animation';
import { useTabDrop, useTabPageDrop } from './tab.drop';
import {
  Input,
  PageTab,
  RemoveTabButton,
  TabDrop,
  TabWrapper,
} from './tab.styles';
import TrashIcon from './trash.svg';

type Props = {
  page: Page;
  index: number;
};

export const Tab: React.FC<Props> = ({ page, index }) => {
  const currentPage = useSelector(contextSelectors.currentPage);
  const totalPages = useSelector(pageSelecors.count);

  const dispatch = useAppDispatch();
  const { dragType } = useDragContext();

  const pageHasErrors = useSelector(contextSelectors.hasErrors(page.uid));

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState<boolean>(false);

  const { canDrop, ref: dropRef } = useTabDrop(currentPage?.uid, page);
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

  const persistInputChanges = (): void => {
    dispatch(
      pageActions.updateLabel({
        uid: page.uid,
        label: inputRef.current.value || page.label,
      })
    );
  };

  const handleKeyboardEvent = (
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === 'Enter') {
      persistInputChanges();
      setIsEditing(false);
    }

    if (event.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const clickOutsideRef = useClickOutside<HTMLDivElement>({
    callback: (): void => {
      persistInputChanges();
      setIsEditing(false);
    },
    isEnabled: isEditing,
  });

  return (
    <TabWrapper ref={connectedRef} className="page-tab">
      {(!!dragType || isDragging) && <TabDrop ref={dropPageRef} />}
      <PageTab
        ref={clickOutsideRef}
        className={classes(
          currentPage?.uid === page.uid && 'active',
          pageHasErrors && 'errors',
          canDrop && 'can-drop',
          isEditing && 'is-editing',
          isDragging && 'is-dragging'
        )}
        style={style}
        onClick={(): void => {
          setIsEditing(false);
          dispatch(contextActions.setPage(page.uid));
        }}
        onDoubleClick={(): void => setIsEditing(true)}
      >
        {isEditing ? (
          <Input
            type="text"
            ref={inputRef}
            autoFocus={true}
            className="text small"
            placeholder={page.label}
            defaultValue={page.label}
            onKeyUp={handleKeyboardEvent}
          />
        ) : (
          <span>{page.label}</span>
        )}

        {totalPages > 1 && (
          <RemoveTabButton
            onClick={(event) => {
              event.stopPropagation();
              if (!confirm(translate('Are you sure?'))) {
                return;
              }

              dispatch(deletePage(page));
            }}
          >
            <TrashIcon />
          </RemoveTabButton>
        )}
      </PageTab>
    </TabWrapper>
  );
};
