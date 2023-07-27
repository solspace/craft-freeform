import { combineReducers } from 'redux';

import fields from './fields';
import layouts from './layouts';
import pages from './pages';
import rows from './rows';

const layout = combineReducers({
  fields,
  pages,
  rows,
  layouts,
});

export default layout;
