import type { FieldFavorite } from '@ff-client/types/fields';
import type { FieldType } from '@ff-client/types/properties';

import type { Cell, Page } from './layout';

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

export type PageDragItem = BaseDragItem<Drag.Page, Page> & { index: number };
export type FieldTypeDragItem = BaseDragItem<Drag.FieldType, FieldType>;
export type FavoriteDragItem = BaseDragItem<Drag.FavoriteField, FieldFavorite>;
export type CellDragItem = BaseDragItem<Drag.Cell, Cell> & { index: number };

export type DragItem =
  | CellDragItem
  | FieldTypeDragItem
  | FavoriteDragItem
  | PageDragItem;
