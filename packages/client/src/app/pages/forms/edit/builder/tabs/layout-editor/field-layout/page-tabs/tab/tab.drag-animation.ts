import type { MutableRefObject } from 'react';
import { useMemo } from 'react';
import type { SpringValue } from 'react-spring';
import { useSpring } from 'react-spring';
import { Drag } from '@editor/builder/types/drag';

import { useDragContext } from '../../../drag.context';

type TabDragAnimation = (
  ref: MutableRefObject<HTMLDivElement>,
  index: number,
  dragItemIndex: number,
  isDragging: boolean
) => {
  x: SpringValue<number>;
};

export const useTabDragAnimation: TabDragAnimation = (
  ref,
  index,
  dragItemIndex,
  isDragging
) => {
  const { dragType, position } = useDragContext();

  const x = useMemo(() => {
    let width = 0;
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      width = rect.width;
    }

    if (dragType === Drag.Page && position !== undefined) {
      if (position === dragItemIndex) {
        return 0;
      } else if (position > dragItemIndex) {
        if (position >= index && index > dragItemIndex) {
          return -width;
        }
      } else if (position <= index && index < dragItemIndex) {
        return width;
      }
    }
    return 0;
  }, [ref, position, dragItemIndex, index]);

  const style = useSpring({
    immediate: dragType !== Drag.Page,
    to: {
      x,
      opacity: isDragging ? 0 : 1,
    },
    config: {
      tension: 500,
    },
  });

  return style;
};
