import type {
  ConditionalRule,
  FreeformManifest,
  ManifestConditionals,
} from "../types/manifest.js";
import { evaluateCondition, type FieldValue } from "./operators.js";

export type VisibilityState = {
  visible: Set<string>;
  hidden: Set<string>;
  enabled: Set<string>;
  disabled: Set<string>;
};

function evaluateRule(
  values: Record<string, FieldValue>,
  hiddenFields: Set<string>,
  rule: ConditionalRule,
): boolean {
  const results = rule.conditions.map((condition) =>
    evaluateCondition(values, hiddenFields, condition),
  );

  if (rule.logic === "any") {
    return results.some(Boolean);
  }

  return results.every(Boolean);
}

function applyFieldRule(
  state: VisibilityState,
  rule: ConditionalRule,
  matched: boolean,
): void {
  const { target, action } = rule;

  switch (action) {
    case "show":
      if (matched) {
        state.visible.add(target);
        state.hidden.delete(target);
      } else {
        state.hidden.add(target);
        state.visible.delete(target);
      }
      break;

    case "hide":
      if (matched) {
        state.hidden.add(target);
        state.visible.delete(target);
      } else {
        state.visible.add(target);
        state.hidden.delete(target);
      }
      break;

    case "enable":
      if (matched) {
        state.enabled.add(target);
        state.disabled.delete(target);
      } else {
        state.disabled.add(target);
        state.enabled.delete(target);
      }
      break;

    case "disable":
      if (matched) {
        state.disabled.add(target);
        state.enabled.delete(target);
      } else {
        state.enabled.add(target);
        state.disabled.delete(target);
      }
      break;

    default:
      break;
  }
}

export function evaluateConditionals(
  manifest: FreeformManifest,
  values: Record<string, FieldValue>,
): VisibilityState {
  const state: VisibilityState = {
    visible: new Set(Object.keys(manifest.fields)),
    hidden: new Set(),
    enabled: new Set(Object.keys(manifest.fields)),
    disabled: new Set(),
  };

  const hiddenFields = new Set<string>();
  let changed = true;
  let iterations = 0;

  while (changed && iterations < 20) {
    changed = false;
    iterations += 1;
    hiddenFields.clear();
    for (const handle of state.hidden) {
      hiddenFields.add(handle);
    }

    const previousHidden = new Set(state.hidden);

    applyConditionalGroup(manifest.conditionals, values, hiddenFields, state);

    for (const handle of state.hidden) {
      if (!previousHidden.has(handle)) {
        changed = true;
      }
    }
  }

  return state;
}

function applyConditionalGroup(
  conditionals: ManifestConditionals,
  values: Record<string, FieldValue>,
  hiddenFields: Set<string>,
  state: VisibilityState,
): void {
  for (const rule of conditionals.fields) {
    applyFieldRule(state, rule, evaluateRule(values, hiddenFields, rule));
  }
}

export function isFieldVisible(
  state: VisibilityState,
  handle: string,
): boolean {
  return !state.hidden.has(handle);
}

export function isFieldEnabled(
  state: VisibilityState,
  handle: string,
): boolean {
  return !state.disabled.has(handle);
}
