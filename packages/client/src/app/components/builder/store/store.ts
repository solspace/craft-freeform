import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { configureStore } from '@reduxjs/toolkit';

import drag from './slices/drag';
import cells from './slices/cells';
import layouts from './slices/layouts';
import pages from './slices/pages';
import rows from './slices/rows';

export const store = configureStore({
  reducer: {
    drag,
    layouts,
    pages,
    rows,
    cells,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
