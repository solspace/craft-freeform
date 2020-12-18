import * as ActionTypes from '../constants/ActionTypes';

export const addRow = (hash, attribute) => ({
  type: ActionTypes.MATRIX_ADD_ROW,
  hash,
  attribute,
});

export const removeRow = (hash, attribute, rowIndex) => ({
  type: ActionTypes.MATRIX_REMOVE_ROW,
  hash,
  attribute,
  rowIndex,
});

export const swapRow = (hash, attribute, oldRowIndex, newRowIndex) => ({
  type: ActionTypes.MATRIX_SWAP_ROW,
  hash,
  attribute,
  oldRowIndex,
  newRowIndex,
});

export const updateColumn = (hash, attribute, rowIndex, name, value) => ({
  type: ActionTypes.MATRIX_UPDATE_COLUMN,
  hash,
  attribute,
  rowIndex,
  name,
  value,
});
