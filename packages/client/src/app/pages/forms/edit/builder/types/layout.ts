export type Layout = {
  uid: string;
};

export type Page = {
  uid: string;
  label: string;
  handle: string;
  layoutUid: string;
  order: number;
};

export type Row = {
  uid: string;
  layoutUid: string;
  order: number;
};

export type Cell = LayoutCell | FieldCell;

type BaseCell = {
  uid: string;
  rowUid: string;
  order: number;
  type: CellType;
};

type LayoutCell = BaseCell & {
  type: CellType.Layout;
  metadata: {
    layoutUid: string;
  };
};

type FieldCell = BaseCell & {
  type: CellType.Field;
  metadata: {
    uid: string;
    label: string;
    handle: string;
    required: boolean;
    properties: Record<string, string | number | boolean | null>;
  };
};

export enum CellType {
  Field = 'field',
  Layout = 'layout',
}
