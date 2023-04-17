import type { ColumnDescription } from '@components/form-controls/control-types/table/table.types';

export const addColumn = (
  columns: ColumnDescription[],
  atIndex: number
): ColumnDescription[] => [
  ...columns.slice(0, atIndex + 1),
  { label: '', type: 'text', value: '' },
  ...columns.slice(atIndex + 1),
];

export const updateColumn = (
  index: number,
  column: ColumnDescription,
  columns: ColumnDescription[]
): ColumnDescription[] => {
  const updated = [...columns];
  updated[index] = column;

  return updated;
};

export const deleteColumn = (
  index: number,
  columns: ColumnDescription[]
): ColumnDescription[] => {
  return columns.filter((_, columnIndex) => columnIndex !== index);
};

export const moveColumn = (
  fromIndex: number,
  toIndex: number,
  columns: ColumnDescription[]
): ColumnDescription[] => {
  // TODO: implement this method
  return columns;
};

export const cleanColumns = (
  columns: ColumnDescription[]
): ColumnDescription[] => {
  return columns.filter((column) => !!column.label || !!column.value);
};
