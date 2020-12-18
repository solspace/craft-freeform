import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
  isFetching: false,
  didInvalidate: false,
  cache: {},
};

/**
 * Deals with AJAX state changes
 *
 * @param state
 * @param action
 *
 * @returns {object}
 */
export function generatedOptionLists(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.REQUEST_GENERATED_OPTIONS:
      return {
        ...state,
        isFetching: true,
      };

    case ActionTypes.RECEIVE_GENERATED_OPTIONS:
      return {
        ...state,
        cache: {
          ...state.cache,
          [action.hash]: action.generatedOptions,
        },
        isFetching: false,
        didInvalidate: false,
      };

    case ActionTypes.INVALIDATE_GENERATED_OPTIONS:
      const clonedState = {
        ...state,
        didInvalidate: true,
      };

      delete clonedState.cache[action.hash];

      return clonedState;

    default:
      return state;
  }
}
