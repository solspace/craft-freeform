import * as ActionTypes from '../constants/ActionTypes';
import * as FieldTypes from '../constants/FieldTypes';
import camelCase from 'lodash.camelcase';

const toString = (value) => (value === null || value === undefined ? '' : String(value));

const isDynamicRecipients = (context) => context?.type === FieldTypes.DYNAMIC_RECIPIENTS;

// Which field types store selection in "values"
const usesValues = (context) =>
  isDynamicRecipients(context) ||
  context?.type === FieldTypes.CHECKBOX_GROUP ||
  context?.type === FieldTypes.MULTIPLE_SELECT;

// For Dynamic Recipients when not checkboxes, values must be single (0..1)
const isValuesSingleSelect = (context) => isDynamicRecipients(context) && !context.showAsCheckboxes;

const normalizeSelectionShape = (context) => {
  if (!context) {
    return;
  }

  if (usesValues(context)) {
    context.values = Array.isArray(context.values) ? context.values.map(toString) : [];

    // Dynamic Recipients select/radio => only allow 0..1 selection in values
    if (isValuesSingleSelect(context) && context.values.length > 1) {
      context.values = context.values.slice(0, 1);
    }

    // values-based fields should never store selection in "value"
    context.value = '';
  } else {
    // single-value fields only
    context.value = toString(context.value);
    context.values = [];
  }
};

const syncValuesWithOptions = (context) => {
  if (!context?.options || !Array.isArray(context.values)) {
    return;
  }

  const allowed = new Set(context.options.map((option) => toString(option.value)));

  context.values = context.values.map(toString).filter((value) => value !== '' && allowed.has(value));

  // If DR is single-select, enforce 0..1 after pruning too
  if (isValuesSingleSelect(context) && context.values.length > 1) {
    context.values = context.values.slice(0, 1);
  }
};

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
    case ActionTypes.ADD_VALUE_SET: {
      if (!state[hash]) {
        return state;
      }

      const existing = state[hash];
      const options = Array.isArray(existing.options) ? [...existing.options] : [];

      options.push({ label: '', value: '' });

      clonedState[hash] = { ...existing, options };

      return clonedState;
    }

    case ActionTypes.CLEAN_UP_VALUES: {
      if (state[hash] && state[hash].options) {
        clonedState[hash] = { ...state[hash] };

        const options = [...state[hash].options];

        let hasModifications = false;

        for (let i = options.length - 1; i >= 0; i--) {
          const { label, value } = options[i];
          if (!label.toString().length && !value.toString().length) {
            options.splice(i, 1);
            hasModifications = true;
          }
        }

        clonedState[hash].options = options;

        const before = clonedState[hash].values;
        if (Array.isArray(before)) {
          clonedState[hash].values = [...before];

          syncValuesWithOptions(clonedState[hash]);

          if (clonedState[hash].values.length !== before.length) {
            hasModifications = true;
          }
        }

        // keep value/values seperated
        normalizeSelectionShape(clonedState[hash]);

        if (hasModifications) {
          return clonedState;
        }
      }

      return state;
    }

    case ActionTypes.UPDATE_VALUE_SET: {
      if (state[hash] && state[hash].options) {
        clonedState[hash] = { ...state[hash] };

        const { label, index } = action;
        const options = [...state[hash].options];

        const previousValue = toString(options[index].value);
        const nextValue = toString(value);
        const nextLabel = toString(label);

        options[index] = {
          ...options[index],
          value: nextValue,
          label: nextLabel,
        };

        clonedState[hash].options = options;

        if (Array.isArray(state[hash].values)) {
          const allowed = new Set(options.map((option) => toString(option.value)));

          const replacedAndFiltered = state[hash].values
            .map(toString)
            .map((value) => (value === previousValue ? nextValue : value))
            .filter((value) => value !== '' && allowed.has(value));

          const seen = new Set();
          clonedState[hash].values = replacedAndFiltered.filter((value) => {
            if (seen.has(value)) {
              return false;
            }

            seen.add(value);

            return true;
          });
        }

        if (clonedState[hash].value !== undefined && toString(clonedState[hash].value) === previousValue) {
          clonedState[hash].value = nextValue;
        }

        // keep value/values seperate
        normalizeSelectionShape(clonedState[hash]);

        // if this field uses values, also prune against new options
        syncValuesWithOptions(clonedState[hash]);

        return clonedState;
      }

      return state;
    }

    case ActionTypes.UPDATE_IS_CHECKED: {
      const { index } = action;

      if (!state[hash]) {
        return state;
      }

      clonedState[hash] = { ...state[hash] };
      const ctx = clonedState[hash];
      const value = toString(ctx.options[index].value);

      if (usesValues(ctx)) {
        if (isValuesSingleSelect(ctx)) {
          // Dynamic Recipients select/radio: checkbox means "set the single selected recipient"
          ctx.values = isChecked ? [value] : [];
        } else {
          // true multi
          const currentValues = Array.isArray(ctx.values) ? [...ctx.values].map(toString) : [];
          const idx = currentValues.indexOf(value);

          if (isChecked && idx === -1) {
            currentValues.push(value);
          }

          if (!isChecked && idx !== -1) {
            currentValues.splice(idx, 1);
          }

          ctx.values = currentValues;
        }

        syncValuesWithOptions(ctx);
      } else {
        ctx.value = isChecked ? value : '';
      }

      normalizeSelectionShape(ctx);
      return clonedState;
    }

    case ActionTypes.INSERT_VALUE: {
      if (!state[hash]) {
        return state;
      }

      clonedState[hash] = { ...state[hash] };
      const ctx = clonedState[hash];
      const next = toString(value);

      if (usesValues(ctx)) {
        if (isValuesSingleSelect(ctx)) {
          ctx.values = [next];
        } else {
          const valuesArr = Array.isArray(ctx.values) ? [...ctx.values].map(toString) : [];
          if (!valuesArr.includes(next)) {
            valuesArr.push(next);
          }

          ctx.values = valuesArr;
        }

        syncValuesWithOptions(ctx);
      } else {
        ctx.value = next;
      }

      normalizeSelectionShape(ctx);
      return clonedState;
    }

    case ActionTypes.REMOVE_VALUE: {
      if (!state[hash]) {
        return state;
      }

      clonedState[hash] = { ...state[hash] };
      const ctx = clonedState[hash];
      const next = toString(value);

      if (usesValues(ctx)) {
        const valuesArr = Array.isArray(ctx.values) ? [...ctx.values].map(toString) : [];
        const idx = valuesArr.indexOf(next);
        if (idx !== -1) {
          valuesArr.splice(idx, 1);
        }

        ctx.values = valuesArr;

        syncValuesWithOptions(ctx);
      } else {
        ctx.value = '';
      }

      normalizeSelectionShape(ctx);

      return clonedState;
    }

    case ActionTypes.TOGGLE_CUSTOM_VALUES: {
      if (!state[hash]) {
        return state;
      }

      const existing = state[hash];
      const options = Array.isArray(existing.options) ? existing.options : [];

      const nextOptions = !isChecked
        ? options.map((item) => ({
            label: item.label,
            value: item.label,
          }))
        : options.map((item) => ({
            label: item.label,
            value: camelCase(item.label),
          }));

      clonedState[hash] = {
        ...existing,
        showCustomValues: !!isChecked,
        options: nextOptions,
      };

      // if selection is values-based, prune and keep structure
      syncValuesWithOptions(clonedState[hash]);
      normalizeSelectionShape(clonedState[hash]);

      return clonedState;
    }

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
 */
function reorderValueSet(state, action) {
  const { index, newIndex, hash } = action;
  const clonedState = { ...state };
  const context = state[hash];
  if (!context?.options) {
    return state;
  }

  const options = [...context.options];
  const [item] = options.splice(index, 1);
  options.splice(newIndex, 0, item);

  clonedState[hash] = { ...context, options };

  syncValuesWithOptions(clonedState[hash]);
  normalizeSelectionShape(clonedState[hash]);

  return clonedState;
}

/**
 * Removes a certain value set
 */
function removeValueSet(state, action) {
  const { hash, index } = action;
  const clonedState = { ...state };
  const context = state[hash];
  if (!context?.options) {
    return state;
  }

  const options = [...context.options.slice(0, index), ...context.options.slice(index + 1)];

  clonedState[hash] = { ...context, options };

  syncValuesWithOptions(clonedState[hash]);
  normalizeSelectionShape(clonedState[hash]);

  return clonedState;
}
