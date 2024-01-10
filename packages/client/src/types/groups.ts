export type GroupData = {
  uid: string;
  label?: string;
  color?: string;
  types: string[];
};

export type GroupItem = {
  hidden?: string[];
  grouped: GroupData[];
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
