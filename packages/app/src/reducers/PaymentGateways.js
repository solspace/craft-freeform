import * as ActionTypes from '../constants/ActionTypes';

const initialState = {
  isFetching: false,
  didInvalidate: false,
  list: [],
};

/**
 * Payment gateways data update
 *
 * @param state
 * @param action
 * @returns {*}
 */
export function paymentGateways(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.REQUEST_PAYMENT_GATEWAYS:
      return {
        ...state,
        isFetching: true,
      };

    case ActionTypes.RECEIVE_PAYMENT_GATEWAYS:
      return {
        ...state,
        list: action.crmData,
        isFetching: false,
        didInvalidate: false,
      };

    case ActionTypes.INVALIDATE_PAYMENT_GATEWAYS:
      return {
        ...state,
        didInvalidate: true,
      };

    case ActionTypes.END_REQUEST_PAYMENT_GATEWAYS:
      return {
        ...state,
        didInvalidate: false,
        isFetching: false,
      };

    case ActionTypes.CREATE_PAYMENT_PLAN:
      return {
        ...state,
      };

    case ActionTypes.END_CREATE_PAYMENT_PLAN:
      return {
        ...state,
      };

    default:
      return state;
  }
}
