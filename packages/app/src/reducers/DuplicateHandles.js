import { UPDATE_DUPLICATE_HANDLE_LIST } from '../constants/ActionTypes';

export const duplicateHandles = (state = [], action) => {
  switch (action.type) {
    case UPDATE_DUPLICATE_HANDLE_LIST:
      return action.duplicateHandles;

    default:
      return state;
  }
};
