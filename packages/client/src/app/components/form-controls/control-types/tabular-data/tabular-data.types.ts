type ColumnType = 'text' | 'select';

export type ColumnConfiguration = {
  key: string;
  label: string;
  type: ColumnType;
};

export type TabularData = ColumnConfiguration[];

export type ColumnValue = string[];
