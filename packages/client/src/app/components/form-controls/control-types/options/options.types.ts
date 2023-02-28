export enum Source {
  CustomOptions = 'customOptions',
  Entries = 'entries',
  Users = 'users',
  Categories = 'categories',
  Tags = 'tags',
  Assets = 'assets',
  CommerceProducts = 'commerceProducts',
  PredefinedOptions = 'predefinedOptions',
}

export const sourceLabels: { [key in Source]: string } = {
  customOptions: 'Custom Options',
  entries: 'Entries',
  users: 'Users',
  categories: 'Categories',
  tags: 'Tags',
  assets: 'Assets',
  commerceProducts: 'Commerce Products',
  predefinedOptions: 'Predefined Options',
};

export type Option = {
  label: string;
  value: string;
  checked: boolean;
};

type BaseOptions = {
  source: Source;
};

export type EntryOptions = BaseOptions & {
  source: Source.Entries;
};

export type CustomOptions = BaseOptions & {
  source: Source.CustomOptions;
  useCustomValues: boolean;
  options: Option[];
};

export type Options = BaseOptions | EntryOptions | CustomOptions;
