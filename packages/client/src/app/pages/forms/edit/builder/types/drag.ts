import type { FieldType } from '@ff-client/types/properties';

import type { Cell } from './layout';

export enum Drag {
  FieldType = 'field-type',
  FavoriteField = 'favorite-field',
  Cell = 'cell',
  Row = 'row',
  Page = 'page',
}

type BaseDragItem<T extends Drag, D> = {
  type: T;
  data: D;
};

type CellDragItem = BaseDragItem<Drag.Cell, Cell> & {
  index: number;
};
type FieldTypeDragItem = BaseDragItem<Drag.FieldType, FieldType>;

export type DragItem = CellDragItem | FieldTypeDragItem;
