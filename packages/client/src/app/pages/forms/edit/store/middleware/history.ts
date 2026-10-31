import type { RootState } from "@editor/store";
import type { Middleware, UnknownAction } from "@reduxjs/toolkit";

import { historyActions, restore, snapshot } from "../history";

const MAX_STEPS = 50;
const COALESCE_MS = 750;

// Query responses and save feedback are not user edits. A reload invalidates
// old snapshots, since they may contain entities from another form or version.
const hydrationActions = new Set([
  "form/setInitialSettings",
  "layout/fields/set",
  "layout/pages/set",
  "layout/rows/set",
  "layout/layouts/set",
  "integrations/set",
  "notifications/set",
  "notifications/clear",
  "translations/init",
  "rules/fields/set",
  "rules/pages/set",
  "rules/buttons/set",
  "rules/notifications/set",
  "rules/integrations/set",
  "rules/submitForm/set",
]);

const editable = (action: UnknownAction): boolean => {
  const type = action.type;
  if (
    !/^(form|layout\/|integrations\/|notifications\/|optionSources\/|rules\/|translations\/)/.test(
      type,
    )
  ) {
    return false;
  }

  if (
    hydrationActions.has(type) ||
    /\/(clearErrors|setErrors|removeError|cleanDirtyValues|emptyIntegrations)$/.test(
      type,
    )
  ) {
    return false;
  }

  // form/update is reserved for loading and save responses.
  return type !== "form/update";
};

const editKey = (action: UnknownAction): string | undefined => {
  if (
    !/(\/edit|\/modify|\/modifySettings|\/update|\/updateLabel|\/editButtons|\/remember)$/.test(
      action.type,
    )
  ) {
    return;
  }

  const payload = action.payload as Record<string, unknown> | undefined;
  const entity =
    payload?.uid ?? payload?.ruleUid ?? payload?.id ?? payload?.siteId;
  if (entity == null && action.type !== "form/modifySettings") {
    return;
  }

  // Consecutive changes to one editor control (including generated handles)
  // form a single history step while typing.
  const property = payload?.key ?? payload?.handle ?? "";
  const group =
    action.type === "layout/fields/edit" &&
    (property === "label" || property === "handle")
      ? "identity"
      : property;
  return `${action.type}:${String(entity ?? payload?.namespace)}:${String(payload?.namespace ?? "")}:${String(group)}`;
};

export const createHistoryMiddleware = (): Middleware<object, RootState> => {
  type Snapshot = ReturnType<typeof snapshot>;
  const past: Snapshot[] = [];
  const future: Snapshot[] = [];
  let pending: Snapshot | undefined;
  let pendingKey: string | undefined;
  let lastKey: string | undefined;
  let lastEditTime = 0;
  let generation = 0;

  return (store) => {
    const counts = (): void => {
      store.dispatch(
        historyActions.setCounts({
          undoCount: past.length,
          redoCount: future.length,
        }),
      );
    };

    const flush = (): void => {
      if (!pending) return;

      const before = pending;
      const key = pendingKey;
      pending = undefined;
      pendingKey = undefined;

      const now = Date.now();
      if (!(key && key === lastKey && now - lastEditTime < COALESCE_MS)) {
        past.push(before);
        if (past.length > MAX_STEPS) past.shift();
      }
      future.length = 0;
      lastKey = key;
      lastEditTime = now;
      counts();
    };

    const clear = (): void => {
      generation++;
      pending = undefined;
      pendingKey = undefined;
      past.length = 0;
      future.length = 0;
      lastKey = undefined;
      counts();
    };

    return (next) => (action) => {
      if (
        typeof action !== "object" ||
        action === null ||
        !("type" in action)
      ) {
        return next(action);
      }

      const edit = action as UnknownAction;
      if (
        edit.type === historyActions.clear.type ||
        hydrationActions.has(edit.type)
      ) {
        const result = next(action);
        clear();
        return result;
      }

      if (
        edit.type === historyActions.undo.type ||
        edit.type === historyActions.redo.type
      ) {
        flush();
        const source = edit.type === historyActions.undo.type ? past : future;
        const target = edit.type === historyActions.undo.type ? future : past;
        const previous = source.pop();
        if (previous) {
          target.push(snapshot(store.getState()));
          store.dispatch(restore(previous));
          lastKey = undefined;
          counts();
        }
        return next(action);
      }

      if (!editable(edit)) return next(action);

      const before = snapshot(store.getState());
      const result = next(action);
      const after = snapshot(store.getState());
      if (
        Object.keys(before).every(
          (key) =>
            before[key as keyof Snapshot] === after[key as keyof Snapshot],
        )
      ) {
        return result;
      }

      if (!pending) {
        pending = before;
        pendingKey = editKey(edit);
        const scheduled = ++generation;
        queueMicrotask(() => {
          if (scheduled === generation) flush();
        });
      } else {
        const key = editKey(edit);
        pendingKey = pendingKey && pendingKey === key ? key : undefined;
      }
      return result;
    };
  };
};
