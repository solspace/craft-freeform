import type { Field } from '@editor/store/slices/layout/fields';
import type { FieldFavorite, FieldType } from '@ff-client/types/fields';

import type { OptionRow, Page } from './layout';

export enum Drag {
  FieldType = 'field-type',
  FavoriteField = 'favorite-field',
  Field = 'field',
  Row = 'row',
  OptionRow = 'option-row',
  Page = 'page',
}

type BaseDragItem<T extends Drag, D> = {
  type: T;
  data: D;
};

export type PageDragItem = BaseDragItem<Drag.Page, Page> & { index: number };
export type FieldTypeDragItem = BaseDragItem<Drag.FieldType, FieldType>;
export type FavoriteDragItem = BaseDragItem<Drag.FavoriteField, FieldFavorite>;
export type FieldDragItem = BaseDragItem<Drag.Field, Field> & { index: number };
export type OptionRowDragItem = BaseDragItem<Drag.OptionRow, OptionRow> & {
  index: number;
};

export type DragItem =
  | FieldDragItem
  | FieldTypeDragItem
  | FavoriteDragItem
  | OptionRowDragItem
  | PageDragItem;
