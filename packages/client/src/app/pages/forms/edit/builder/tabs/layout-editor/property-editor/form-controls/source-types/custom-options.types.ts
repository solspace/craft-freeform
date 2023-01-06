export type Option = {
  label: string;
  value: string;
  checked: boolean;
};

export type CustomOptions = {
  useCustomValues?: boolean;
  options?: Option[];
};
