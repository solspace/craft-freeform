import { combineReducers } from 'redux';

import './rules.persistence';

import fields from './fields';
import pages from './pages';

const rules = combineReducers({
  fields,
  pages,
});

export default rules;
