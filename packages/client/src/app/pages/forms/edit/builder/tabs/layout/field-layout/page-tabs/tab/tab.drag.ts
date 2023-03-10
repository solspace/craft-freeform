import type { ConnectDragSource } from 'react-dnd';
import { useDrag } from 'react-dnd';
import type { PageDragItem } from '@editor/builder/types/drag';
import { Drag } from '@editor/builder/types/drag';
import type { Page } from '@editor/builder/types/layout';

import { useDragContext } from '../../../drag.context';

type CollectedProps = {
  isDragging: boolean;
};

type TabDrag = (
  index: number,
  page: Page
) => CollectedProps & {
  ref: ConnectDragSource;
};

export const useTabDrag: TabDrag = (index, page) => {
  const { dragOff } = useDragContext();
  const [{ isDragging }, ref] = useDrag<PageDragItem, unknown, CollectedProps>({
    type: Drag.Page,
    item: { type: Drag.Page, data: page, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      dragOff();
    },
  });

  return { isDragging, ref };
};
