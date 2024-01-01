export type GroupData = {
  uid: string;
  label?: string;
  color?: string;
  types: number[];
};

export type GroupItem = {
  hidden?: number[];
  grouped: GroupData[];
  unassigned?: number[];
};

export type Group = {
  types?: string[];
  groups?: GroupItem;
};

export interface FieldListRefs {
  unassigned?: HTMLDivElement | null;
  hidden?: HTMLDivElement | null;
  [key: string]: HTMLDivElement | undefined;
}
