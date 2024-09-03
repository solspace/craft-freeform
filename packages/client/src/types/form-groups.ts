import type { FormWithStats } from './forms';

export type GroupItem = {
  uid: string;
  label?: string;
  formIds: number[];
  forms?: FormWithStats[];
};

export type FormGroup = {
  siteId?: number | string;
  site?: string;
  groups: GroupItem[];
};

export type FormWithGroup = {
  forms?: FormWithStats[];
  formGroups?: FormGroup;
  archivedForms?: FormWithStats[];
};

export interface FormGroupsListRefs {
  unassigned?: HTMLDivElement | null;
  [key: string]: HTMLDivElement | undefined;
}
