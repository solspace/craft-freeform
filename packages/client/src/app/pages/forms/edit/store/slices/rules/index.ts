import { combineReducers } from 'redux';

import './rules.persistence';

import fields from './fields';

const rules = combineReducers({
  fields,
});

export default rules;
