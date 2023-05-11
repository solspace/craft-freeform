import type { Rule } from '@ff-client/types/rules';
import { combineReducers } from 'redux';

import './rules.persistence';

import fields from './fields';
import notifications from './notifications';
import pages from './pages';

export type RuleState<T extends Rule> = {
  initialized: boolean;
  items: T[];
};

const rules = combineReducers({
  fields,
  pages,
  notifications,
});

export default rules;
