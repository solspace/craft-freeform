import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { Action, AnyAction } from '@reduxjs/toolkit';
import { configureStore } from '@reduxjs/toolkit';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import thunk from 'redux-thunk';

import { statePersistMiddleware } from './middleware/state-persist';
import context from './slices/context';
import fields from './slices/fields';
import form from './slices/form';
import integrations from './slices/integrations';
import layout from './slices/layout';
import notifications from './slices/notifications';
import search from './slices/search';

export const store = configureStore({
  middleware: [thunk, statePersistMiddleware],
  reducer: {
    form,
    fields,
    layout,
    integrations,
    notifications,
    context,
    search,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, void, Action>;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, AnyAction>;

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
