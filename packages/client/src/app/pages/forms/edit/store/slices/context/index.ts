import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

export enum FocusType {
  Page = 'page',
  Field = 'field',
  Row = 'row',
}

export enum State {
  Idle,
  Processing,
}

export type Focus = {
  active: boolean;
  type: FocusType;
  uid: string;
};

type ContextState = {
  page?: string;
  focus: Focus;
  state: State;
};

const initialState: ContextState = {
  state: State.Idle,
  page: null,
  focus: {
    active: false,
    type: null,
    uid: null,
  },
};

const contextSlice = createSlice({
  name: 'context',
  initialState,
  reducers: {
    setPage: (state, { payload }: PayloadAction<string | null>) => {
      state.page = payload;
    },
    setFocusedItem: (
      state,
      { payload }: PayloadAction<Omit<Focus, 'active'>>
    ) => {
      if (
        state.focus.active === true &&
        state.focus.uid === payload.uid &&
        state.focus.type === payload.type
      ) {
        return;
      }

      state.focus = { active: true, ...payload };
    },
    setState: (state, { payload }: PayloadAction<State>) => {
      state.state = payload;
    },
    focus: (state) => {
      state.focus.active = true;
    },
    unfocus: (state) => {
      state.focus.active = false;
    },
  },
});

const { actions } = contextSlice;
export { actions as contextActions };

export default contextSlice.reducer;
