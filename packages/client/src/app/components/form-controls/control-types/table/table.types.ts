export type TableColumnMetadata = {
  minLength?: number | null;
  maxLength?: number | null;
  decimalCount?: number | null;
  step?: number | null;
  minMaxValues?: [number | null, number | null];
  fileCount?: number;
  maxFileSizeKB?: number;
  fileKinds?: string[];
  assetSourceId?: number | null;
  uploadLocation?: string | null;
};

export type ColumnDescription = {
  label: string;
  type: string;
  value: string;
  placeholder?: string;
  options?: string[];
  checked?: boolean;
  required?: boolean;
  metadata?: TableColumnMetadata;
};
