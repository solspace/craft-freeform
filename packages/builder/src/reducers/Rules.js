import * as ActionTypes from '../constants/ActionTypes';
import { RULES } from '../constants/FieldTypes';

const initialState = {
  type: RULES,
  list: {},
};

const pageBlockDefaults = {
  fieldRules: [],
  gotoRules: [],
};

const fieldRuleDefaults = {
  hash: '',
  show: true,
  matchAll: false,
  criteria: [],
};

const gotoRuleDefaults = {
  targetPageHash: null,
  matchAll: false,
  criteria: [],
};

const criteriaDefaults = {
  hash: '',
  equals: true,
  value: '',
};

const addPageBlock = (state, { pageHash }) => {
  const clone = { ...state };

  if (Array.isArray(clone.list)) {
    clone.list = { ...clone.list };
  }

  clone.list[pageHash] = { ...pageBlockDefaults };

  return clone;
};

const removePageBlock = (state, { pageHash }) => {
  const clone = { ...state };
  delete clone.list[pageHash];

  return clone;
};

const addFieldRule = (state, { pageHash, hash }) => {
  const clone = { ...state };

  clone.list[pageHash].fieldRules.push({
    ...fieldRuleDefaults,
    hash,
  });

  return clone;
};

const removeFieldRule = (state, { pageHash, index }) => {
  const clone = { ...state };
  clone.list[pageHash].fieldRules.splice(index, 1);

  return clone;
};

const addGotoRule = (state, { pageHash, targetPageHash }) => {
  const clone = { ...state };
  clone.list[pageHash].gotoRules.push({
    ...gotoRuleDefaults,
    targetPageHash,
  });

  return clone;
};

const removeGotoRule = (state, { pageHash, index }) => {
  const clone = { ...state };
  clone.list[pageHash].gotoRules.splice(index, 1);

  return clone;
};

const toggleFieldRuleShow = (state, { pageHash, index }) => {
  const clone = { ...state };

  clone.list[pageHash].fieldRules[index].show = !clone.list[pageHash].fieldRules[index].show;

  return clone;
};

const toggleFieldRuleMatchAll = (state, { pageHash, target, index }) => {
  const clone = { ...state };
  const targetKey = `${target}Rules`;

  clone.list[pageHash][targetKey][index].matchAll = !clone.list[pageHash][targetKey][index].matchAll;

  return clone;
};

const manageRuleCriteria = (state, action) => {
  const { pageHash, target, ruleIndex, index } = action;
  const targetKey = `${target}Rules`;

  const criteriaState = [...state.list[pageHash][targetKey][ruleIndex].criteria];

  switch (action.type) {
    case ActionTypes.ADD_RULE_CRITERIA:
      criteriaState.push({
        ...criteriaDefaults,
        hash: action.hash,
      });

      break;

    case ActionTypes.REMOVE_RULE_CRITERIA:
      criteriaState.splice(index, 1);

      break;

    case ActionTypes.UPDATE_RULE_CRITERIA_HASH:
      criteriaState[index].hash = action.hash;
      criteriaState[index].value = '';

      break;

    case ActionTypes.TOGGLE_RULE_CRITERIA_EQUALS:
      criteriaState[index].equals = !criteriaState[index].equals;

      break;

    case ActionTypes.UPDATE_RULE_CRITERIA_VALUE:
      criteriaState[index].value = action.value;

      break;

    default:
      return state;
  }

  const clone = JSON.parse(JSON.stringify(state));
  clone.list[pageHash][targetKey][ruleIndex].criteria = criteriaState;

  return clone;
};

export const removePageCallback = (state, action) => {
  const { index } = action;
  const clone = { ...state };

  const removedPageHash = `page${index}`;
  if (clone.rules.list[removedPageHash]) {
    delete clone.rules.list[removedPageHash];
  }

  for (const [pageHash, { gotoRules }] of Object.entries(clone.rules.list)) {
    gotoRules.forEach((rule, i) => {
      if (removedPageHash === rule.targetPageHash) {
        clone.rules.list[pageHash].gotoRules.splice(i, 1);
      }
    });
  }

  return clone;
};

export const manageRules = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.ADD_PAGE_BLOCK:
      return addPageBlock(state, action);

    case ActionTypes.REMOVE_PAGE_BLOCK:
      return removePageBlock(state, action);

    case ActionTypes.ADD_FIELD_RULE:
      return addFieldRule(state, action);

    case ActionTypes.REMOVE_FIELD_RULE:
      return removeFieldRule(state, action);

    case ActionTypes.ADD_GOTO_RULE:
      return addGotoRule(state, action);

    case ActionTypes.REMOVE_GOTO_RULE:
      return removeGotoRule(state, action);

    case ActionTypes.TOGGLE_FIELD_RULE_SHOW:
      return toggleFieldRuleShow(state, action);

    case ActionTypes.TOGGLE_RULE_MATCH_ALL:
      return toggleFieldRuleMatchAll(state, action);

    case ActionTypes.ADD_RULE_CRITERIA:
    case ActionTypes.REMOVE_RULE_CRITERIA:
    case ActionTypes.UPDATE_RULE_CRITERIA_HASH:
    case ActionTypes.TOGGLE_RULE_CRITERIA_EQUALS:
    case ActionTypes.UPDATE_RULE_CRITERIA_VALUE:
      return manageRuleCriteria(state, action);

    default:
      return state;
  }
};
