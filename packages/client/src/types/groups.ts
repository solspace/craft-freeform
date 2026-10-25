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
  catalogs?: {
    content: string[];
    layout: string[];
    templates?: string[];
    templateDetails?: Record<
      string,
      { name: string; description: string; preview: string }
    >;
  };
  types?: string[];
  groups?: GroupItem;
};

export interface FieldListRefs {
  content?: HTMLDivElement | null;
  layoutCatalog?: HTMLDivElement | null;
  unassigned?: HTMLDivElement | null;
  hidden?: HTMLDivElement | null;
  [key: string]: HTMLDivElement | undefined;
}
