type Type = 'boolean' | 'select' | 'toggles' | 'group';

type Option = {
  value: string;
  label: string;
};

type BaseItem = {
  id: string;
  name: string;
  type: Type;
  children?: Item[];
};

export type BooleanItem = BaseItem & {
  type: 'boolean';
  enabled: boolean;
};

export type SelectItem = BaseItem & {
  type: 'select';
  value: string;
  options: Option[];
};

export type TogglesItem = BaseItem & {
  type: 'toggles';
  values: string[];
  options: Option[];
};

export type GroupItem = BaseItem & {
  type: 'group';
};

export type Item = BooleanItem | TogglesItem | SelectItem | GroupItem;

export type ItemEdit = {
  value?: string;
  values?: string[];
  enabled?: boolean;
};

export type RecursiveUpdate = (id: string, updates: ItemEdit) => void;
