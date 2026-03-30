import type { Rule } from "@ff-client/types/rules";
import { combineReducers } from "redux";

import "./rules.persistence";

import buttons from "./buttons";
import fields from "./fields";
import integrations from "./integrations";
import notifications from "./notifications";
import pages from "./pages";
import submitForm from "./submit-form";

export type RuleState<T extends Rule> = {
  initialized: boolean;
  items: T[];
};

const rules = combineReducers({
  fields,
  pages,
  notifications,
  integrations,
  submitForm,
  buttons,
});

export default rules;
