import type { ColumnDescription } from '@editor/builder/tabs/layout-editor/property-editor/form-controls/table/table.types';

export const addColumn = (
  columns: ColumnDescription[]
): ColumnDescription[] => {
  const updated = [...columns];
  updated.push({
    label: '',
    type: 'text',
    value: '',
  });

  return updated;
};

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
