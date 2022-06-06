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

export type Cell = {
  uid: string;
  rowUid: string;
  order: number;
  type: string;
  metadata: Record<string, any>;
};
