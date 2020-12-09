import * as ActionTypes from '../constants/ActionTypes';

const addConnection = (state) => {
  if (state.list === null) {
    state.list = [];
  }

  state.list.push({ type: 'entries' });

  return state;
};

const removeConnection = (state, index) => {
  return {
    ...state,
    list: [...state.list.slice(0, index), ...state.list.slice(index + 1)],
  };
};

const updateConnection = (state, index, properties) => {
  const clonedState = { ...state };
  clonedState.list[index] = properties;

  return clonedState;
};

export function manageConnections(state, action) {
  switch (action.type) {
    case ActionTypes.ADD_CONNECTION:
      return addConnection(state);

    case ActionTypes.REMOVE_CONNECTION:
      return removeConnection(state, action.index);

    case ActionTypes.UPDATE_CONNECTION:
      return updateConnection(state, action.index, action.properties);

    default:
      return state;
  }
}
