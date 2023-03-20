import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { Action, AnyAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import thunk from 'redux-thunk';

import { statePersistMiddleware } from './middleware/state-persist';
import cells from './slices/cells';
import context from './slices/context';
import drag from './slices/drag';
import fields from './slices/fields';
import form from './slices/form';
import integrations from './slices/integrations';
import layouts from './slices/layouts';
import notifications from './slices/notifications';
import pages from './slices/pages';
import rows from './slices/rows';
import search from './slices/search';

export const store = configureStore({
  middleware: [thunk, statePersistMiddleware],
  reducer: {
    form,
    fields,
    context,
    integrations,
    notifications,
    layouts,
    pages,
    rows,
    cells,
    search,
    drag,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, void, Action>;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, AnyAction>;

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
