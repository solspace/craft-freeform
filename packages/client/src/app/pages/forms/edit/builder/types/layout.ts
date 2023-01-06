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
