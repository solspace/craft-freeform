import { configureStore } from '@reduxjs/toolkit';

import modal from './slices/modal';

export const store = configureStore({
  reducer: {
    modal,
  },
});

export type RootState = ReturnType<typeof store.getState>;
