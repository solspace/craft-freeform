export type TableColumnMetadata = {
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
