import type { Condition, SubmitFormRule } from '@ff-client/types/rules';
import { Operator } from '@ff-client/types/rules';
import { Combinator } from '@ff-client/types/rules';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

type SubmitFormRuleState = {
  item?: SubmitFormRule;
};

const initialState: SubmitFormRuleState = {};

export const submitFormRulesSlice = createSlice({
  name: 'rules/submit-form',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<SubmitFormRule>) => {
      state.item = action.payload;
    },
    add: (state) => {
      state.item = {
        uid: v4(),
        enabled: true,
        combinator: Combinator.Or,
        conditions: [
          {
            uid: v4(),
            field: '',
            operator: Operator.Equals,
            value: '',
          },
        ],
      };
    },
    modifyCombinator: (state, action: PayloadAction<Combinator>) => {
      state.item.combinator = action.payload;
    },
    modifyConditions: (state, action: PayloadAction<Condition[]>) => {
      state.item.conditions = action.payload;
    },
    remove: (state) => {
      state.item = undefined;
    },
  },
});

const { actions } = submitFormRulesSlice;
export { actions as submitFormRuleActions };

export default submitFormRulesSlice.reducer;
