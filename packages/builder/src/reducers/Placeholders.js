import * as ActionTypes from '../constants/ActionTypes';
import { COLUMN, PAGE, ROW } from '../constants/DraggableTypes';

const initialState = {
  type: null,
  rowIndex: null,
  index: null,
  targetHash: null,
  pageIndex: null,
};

export function placeholders(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.ADD_PLACEHOLDER_ROW:
      return {
        ...initialState,
        type: ROW,
        rowIndex: action.rowIndex,
        targetHash: action.targetHash,
      };

    case ActionTypes.ADD_PLACEHOLDER_COLUMN:
      return {
        ...initialState,
        type: COLUMN,
        rowIndex: action.rowIndex,
        index: action.index,
        targetHash: action.targetHash,
      };

    case ActionTypes.ADD_PLACEHOLDER_PAGE:
      return {
        ...initialState,
        type: PAGE,
        pageIndex: action.pageIndex,
      };

    case ActionTypes.CLEAR_PLACEHOLDERS:
      return { ...initialState };

    default:
      return state;
  }
}
