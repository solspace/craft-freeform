import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import cells from './slices/cells';
import drag from './slices/drag';
import layouts from './slices/layouts';
import pages from './slices/pages';
import rows from './slices/rows';
import search from './slices/search';

export const store = configureStore({
  reducer: {
    drag,
    layouts,
    pages,
    rows,
    cells,
    search,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
