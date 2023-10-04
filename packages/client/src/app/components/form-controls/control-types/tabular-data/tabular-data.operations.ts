import type {
  ColumnConfiguration,
  ColumnValue,
} from '@components/form-controls/control-types/tabular-data/tabular-data.types';
import update from 'immutability-helper';

export const addRow = (
  rows: ColumnValue[],
  configuration: ColumnConfiguration[],
  atIndex: number
): ColumnValue[] => [
  ...rows.slice(0, atIndex + 1),
  [...configuration.map(() => '')],
  ...rows.slice(atIndex + 1),
];

export const updateRow = (
  index: number,
  value: ColumnValue,
  rows: ColumnValue[]
): ColumnValue[] => {
  const updated = [...rows];
  updated[index] = value;

  return updated;
};

export const deleteRow = (
  index: number,
  rows: ColumnValue[]
): ColumnValue[] => {
  return rows.filter((_, columnIndex) => columnIndex !== index);
};

export const moveRow = (
  fromIndex: number,
  toIndex: number,
  rows: ColumnValue[]
): ColumnValue[] => {
  const prevRows = [...rows];

  return update(prevRows, {
    $splice: [
      [fromIndex, 1],
      [toIndex, 0, prevRows[fromIndex] as ColumnValue],
    ],
  });
};

export const cleanRows = (rows: ColumnValue[]): ColumnValue[] => {
  return rows.filter((row) => row.filter(Boolean).length !== 0);
};
