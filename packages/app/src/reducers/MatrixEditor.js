import * as ActionTypes from '../constants/ActionTypes';

const addRow = (state) => [...state, {}];

const removeRow = (state, { rowIndex }) => [...state.slice(0, rowIndex), ...state.slice(rowIndex + 1)];

const swapRow = (state, { oldRowIndex, newRowIndex }) => {
  const swappable = [...state];
  const temp = swappable[oldRowIndex];

  swappable.splice(oldRowIndex, 1);
  swappable.splice(newRowIndex, 0, temp);

  return swappable;
};

const updateColumn = (state, { rowIndex, name, value }) => {
  const clone = [...state];

  if (!clone[rowIndex]) {
    clone[rowIndex] = {};
  }

  clone[rowIndex] = {
    ...clone[rowIndex],
    [name]: value,
  };

  return clone;
};

export const manageMatrixEditor = (state, action) => {
  switch (action.type) {
    case ActionTypes.MATRIX_ADD_ROW:
      return addRow(state);

    case ActionTypes.MATRIX_REMOVE_ROW:
      return removeRow(state, action);

    case ActionTypes.MATRIX_SWAP_ROW:
      return swapRow(state, action);

    case ActionTypes.MATRIX_UPDATE_COLUMN:
      return updateColumn(state, action);

    default:
      return state;
  }
};
