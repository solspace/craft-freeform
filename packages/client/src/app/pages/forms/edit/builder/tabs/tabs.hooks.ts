import { useCallback, useSyncExternalStore } from "react";
import { useParams } from "react-router-dom";

type Tabs = Record<string, null | string>;
type LastTab = {
  lastTab: string | null;
  setLastTab: (tab?: string | null) => void;
};

const SESSION_NAMESPACE = "freeform-builder-tabs";
const listeners = new Set<() => void>();

const getSessionTabs = (formId?: string): Tabs => {
  if (!formId) {
    return {};
  }

  const storedTabs = JSON.parse(
    sessionStorage.getItem(SESSION_NAMESPACE) || "{}",
  );

  return storedTabs[formId] || {};
};

const setSessionTabs = (formId: string, tabs: Tabs): void => {
  const previousState = JSON.parse(
    sessionStorage.getItem(SESSION_NAMESPACE) || "{}",
  );

  sessionStorage.setItem(
    SESSION_NAMESPACE,
    JSON.stringify({ ...previousState, [formId]: tabs }),
  );
};

const getSessionTab = (
  formId: string | undefined,
  namespace: string,
): string | null => getSessionTabs(formId)[namespace] ?? null;

const emitChange = (): void => {
  listeners.forEach((listener) => {
    listener();
  });
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
};

export const useLastTab = (namespace: string): LastTab => {
  const { formId } = useParams();
  const lastTab = useSyncExternalStore(subscribe, () =>
    getSessionTab(formId, namespace),
  );

  const setLastTab = useCallback(
    (tab?: string | null): void => {
      if (!formId) {
        return;
      }

      setSessionTabs(formId, {
        ...getSessionTabs(formId),
        [namespace]: tab ?? null,
      });

      emitChange();
    },
    [formId, namespace],
  );

  return {
    lastTab,
    setLastTab,
  };
};
