import { combineReducers } from 'redux';

import cells from './cells';
import layouts from './layouts';
import pages from './pages';
import rows from './rows';

const layout = combineReducers({
  pages,
  rows,
  cells,
  layouts,
});

export default layout;
