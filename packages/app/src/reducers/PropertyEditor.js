import * as ActionTypes from '../constants/ActionTypes';
import * as FieldTypes from '../constants/FieldTypes';

export function properties(state = [], action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function modifyGroupValues(state = [], action) {
  const { hash, isChecked, value = null } = action;
  let clonedState = { ...state };

  switch (action.type) {
    case ActionTypes.ADD_VALUE_SET:
      if (state[hash]) {
        if (!state[hash].options) {
          state[hash].options = [];
        }

        clonedState[hash].options.push({
          label: '',
          value: '',
        });

        return clonedState;
      }

      return state;

    case ActionTypes.CLEAN_UP_VALUES:
      if (state[hash] && state[hash].options) {
        let options = [...state[hash].options];

        let hasModifications = false;
        for (let i = 0; i < options.length; i++) {
          const { label, value } = options[i];

          if (!label.toString().length && !value.toString().length) {
            options.splice(i, 1);
            hasModifications = true;
          }
        }

        let values = [];
        if (state[hash].values !== undefined) {
          values = [...state[hash].values];
          if (values.indexOf('') !== -1) {
            values.splice(values.indexOf(''), 1);
            hasModifications = true;
          }
        }

        if (hasModifications) {
          clonedState[hash].options = options;
          clonedState[hash].values = values;

          return clonedState;
        }
      }

      return state;

    case ActionTypes.UPDATE_VALUE_SET:
      if (state[hash] && state[hash].options) {
        let { label, index } = action;

        const options = [...state[hash].options];
        const previousValue = options[index].value;

        options[index].value = value + '';
        options[index].label = label + '';

        clonedState[hash].options = options;

        if (state[hash].values !== undefined) {
          const values = [...state[hash].values];
          const previousValueIndex = values.indexOf(previousValue);
          if (previousValueIndex !== -1) {
            values[previousValueIndex] = value;
          }
          clonedState[hash].values = values;
        }

        if (clonedState[hash].value !== undefined && clonedState[hash].value === previousValue) {
          clonedState[hash].value = value;
        }

        return clonedState;
      }

      return state;

    case ActionTypes.UPDATE_IS_CHECKED:
      let { index } = action;

      const val = clonedState[hash].options[index].value;

      switch (clonedState[hash].type) {
        case FieldTypes.CHECKBOX_GROUP:
        case FieldTypes.DYNAMIC_RECIPIENTS:
        case FieldTypes.MULTIPLE_SELECT:
          const truncateValues =
            clonedState[hash].type === FieldTypes.DYNAMIC_RECIPIENTS && !clonedState[hash].showAsCheckboxes;
          if (clonedState[hash].values === undefined || truncateValues) {
            clonedState[hash].values = [];
          }

          const valueIndex = clonedState[hash].values.indexOf(val);
          if (isChecked && valueIndex === -1) {
            clonedState[hash].values.push(val);
          }

          if (!isChecked && valueIndex !== -1) {
            clonedState[hash].values.splice(valueIndex, 1);
          }

          break;

        default:
          clonedState[hash].value = isChecked ? val : '';
          break;
      }

      return clonedState;

    case ActionTypes.INSERT_VALUE:
      const context = clonedState[hash];
      switch (context.type) {
        case FieldTypes.CHECKBOX_GROUP:
        case FieldTypes.DYNAMIC_RECIPIENTS:
        case FieldTypes.MULTIPLE_SELECT:
          if (clonedState[hash].values === undefined) {
            clonedState[hash].values = [];
          }

          const valueIndex = clonedState[hash].values.indexOf(value);
          if (valueIndex === -1) {
            clonedState[hash].values.push(value);
          }

          break;

        default:
          clonedState[hash].value = value;
          break;
      }

      return clonedState;

    case ActionTypes.REMOVE_VALUE:
      switch (clonedState[hash].type) {
        case FieldTypes.CHECKBOX_GROUP:
        case FieldTypes.DYNAMIC_RECIPIENTS:
        case FieldTypes.MULTIPLE_SELECT:
          if (clonedState[hash].values === undefined) {
            return clonedState;
          }

          const valueIndex = clonedState[hash].values.indexOf(value);
          if (valueIndex !== -1) {
            clonedState[hash].values.splice(valueIndex, 1);
          }

          break;

        default:
          clonedState[hash].value = '';
          break;
      }

      return clonedState;

    case ActionTypes.TOGGLE_CUSTOM_VALUES:
      clonedState[hash].showCustomValues = isChecked;

      if (!isChecked) {
        if (clonedState[hash].options) {
          clonedState[hash].options = clonedState[hash].options.map((item) => ({
            label: item.label,
            value: item.label,
          }));
        }
      }

      return clonedState;

    case ActionTypes.REORDER_VALUE_SET:
      return reorderValueSet(state, action);

    case ActionTypes.REMOVE_VALUE_SET:
      return removeValueSet(state, action);

    default:
      return state;
  }
}

/**
 * Reorders the rows in value sets
 *
 * @param state
 * @param action
 * @returns {*}
 */
function reorderValueSet(state, action) {
  const { index, newIndex, hash } = action;
  const clonedState = { ...state };

  const item = clonedState[hash].options[index];

  clonedState[hash].options.splice(index, 1);
  clonedState[hash].options.splice(newIndex, 0, item);

  return clonedState;
}

/**
 * Removes a certain value set
 *
 * @param state
 * @param action
 * @returns {Object}
 */
function removeValueSet(state, action) {
  const { hash, index } = action;
  const clonedState = { ...state };

  clonedState[hash].options = [
    ...clonedState[hash].options.slice(0, index),
    ...clonedState[hash].options.slice(index + 1),
  ];

  return clonedState;
}
