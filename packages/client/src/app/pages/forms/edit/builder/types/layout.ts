export enum Drag {
  FieldType = 'field-type',
  FavoriteField = 'favorite-field',
  Cell = 'cell',
  Row = 'row',
  Page = 'page',
}

export type Layout = {
  uid: string;
};

export type Page = {
  uid: string;
  label: string;
  layoutUid: string;
  order: number;
};

export type Row = {
  uid: string;
  layoutUid: string;
  order: number;
};

export enum CellType {
  Field = 'field',
  Layout = 'layout',
}

export type Cell = {
  uid: string;
  type: CellType;
  rowUid: string;
  order: number;
  targetUid: string;
};
