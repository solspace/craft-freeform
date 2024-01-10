import type { Page } from '@editor/builder/types/layout';
import type { GenericValue } from '@ff-client/types/properties';
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

type EditButtonsPayload = {
  uid: string;
  key: string;
  value: GenericValue;
};

const initialState: PagesStore = [];

export const pagesSlice = createSlice({
  name: 'layout/pages',
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
      state.splice(
        state.findIndex((page) => page.uid === action.payload),
        1
      );

      state.forEach((page) => {
        page.order = order++;
      });
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
    editButtons: (state, action: PayloadAction<EditButtonsPayload>) => {
      const { uid, key, value } = action.payload;
      const buttons = state.find((page) => page.uid === uid).buttons;
      if (!buttons) {
        return;
      }

      Object.assign(buttons, { [key]: value });
    },
  },
});

const { actions } = pagesSlice;
export { actions as pageActions };

export default pagesSlice.reducer;
