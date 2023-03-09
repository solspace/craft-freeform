import type { Page } from '@editor/builder/types/layout';
import type { RootState } from '@editor/store';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export type PagesStore = Page[];

type MoveToPayload = {
  uid: string;
  order: number;
};

type UpdateLabelPayload = {
  uid: string;
  label: string;
};

const initialState: PagesStore = [];

const sortByOrder = (a: Page, b: Page): number => a.order - b.order;

export const pagesSlice = createSlice({
  name: 'pages',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<PagesStore>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (state, action: PayloadAction<Omit<Page, 'order'>>) => {
      const maxOrder = Math.max(...[-1, ...state.map((page) => page.order)]);

      state.push({
        ...action.payload,
        order: maxOrder + 1,
      });
    },
    remove: (state, action: PayloadAction<string>) => {
      let order = 0;
      state = state
        .filter((page) => page.uid !== action.payload)
        .map((page) => ({ ...page, order: order++ }));
    },
    moveTo: (state, action: PayloadAction<MoveToPayload>) => {
      const { uid, order } = action.payload;

      const page = state.find((page) => page.uid === uid);
      const originalOrder = page.order;
      page.order = order;

      state
        .filter((page) => page.uid !== uid)
        .filter((page) => page.order.inRange(order, originalOrder))
        .forEach((page) => {
          if (order > originalOrder) {
            page.order -= 1;
          }

          if (order < originalOrder) {
            page.order += 1;
          }
        });
    },
    updateLabel: (state, action: PayloadAction<UpdateLabelPayload>) => {
      const { uid, label } = action.payload;

      state.find((page) => page.uid === uid).label = label;
    },
  },
});

export const { set, add, moveTo, updateLabel, remove } = pagesSlice.actions;

export const selectPages = (state: RootState): Page[] =>
  [...state.pages].sort(sortByOrder);

export const selectPage =
  (uid: string) =>
  (state: RootState): Page | undefined =>
    state.pages.find((page) => page.uid === uid);

export default pagesSlice.reducer;
