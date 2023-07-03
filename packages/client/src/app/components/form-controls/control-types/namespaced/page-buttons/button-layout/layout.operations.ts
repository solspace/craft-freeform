import type { LayoutElement } from './layout.types';

export const extractElements = (layout: string): LayoutElement[] => {
  const groups = layout.split(' ');
  const layoutElements: LayoutElement[] = [];
  groups.forEach((group, idx) => {
    if (idx > 0) {
      layoutElements.push({ type: 'space' });
    }
    group.split('|').forEach((element) => {
      const layoutElement: LayoutElement = {
        type: element,
      };
      layoutElements.push(layoutElement);
    });
  });

  return layoutElements;
};
