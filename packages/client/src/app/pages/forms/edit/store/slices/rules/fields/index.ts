import type { Condition, FieldRule } from '@ff-client/types/rules';
import { Operator } from '@ff-client/types/rules';
import { Combinator, Display } from '@ff-client/types/rules';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { v4 } from 'uuid';

type FieldRulesState = FieldRule[];

const initialState: FieldRulesState = [];

type ModifyCondition = {
  ruleUid: string;
  conditions: Condition[];
};

type ChangeDisplay = {
  ruleUid: string;
  display: Display;
};

type ChangeCombinator = {
  ruleUid: string;
  combinator: Combinator;
};

export const fieldRulesSlice = createSlice({
  name: 'rules/fields',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<FieldRulesState>) => {
      state.splice(0, state.length, ...action.payload);
    },
    add: (state, action: PayloadAction<string>) => {
      const fieldUid = action.payload;

      state.push({
        uid: v4(),
        enabled: true,
        display: Display.Show,
        combinator: Combinator.Or,
        conditions: [
          {
            uid: v4(),
            field: '',
            operator: Operator.Equals,
            value: '',
          },
        ],
        field: fieldUid,
      });
    },
    modifyDisplay: (state, action: PayloadAction<ChangeDisplay>) => {
      const { ruleUid, display } = action.payload;

      const modifyRule = state.find((rule) => rule.uid === ruleUid);
      modifyRule.display = display;
    },
    modifyCombinator: (state, action: PayloadAction<ChangeCombinator>) => {
      const { ruleUid, combinator } = action.payload;

      const modifyRule = state.find((rule) => rule.uid === ruleUid);
      modifyRule.combinator = combinator;
    },
    modifyConditions: (state, action: PayloadAction<ModifyCondition>) => {
      const { ruleUid, conditions } = action.payload;

      const modifyRule = state.find((rule) => rule.uid === ruleUid);
      modifyRule.conditions = conditions;
    },
    remove: (state, action: PayloadAction<string>) => {
      state = state.filter((rule) => rule.uid !== action.payload);
    },
  },
});

const { actions } = fieldRulesSlice;
export { actions as fieldRuleActions };

export default fieldRulesSlice.reducer;
