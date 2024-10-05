import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

type Tabs = Record<string, null | string>;
type LastTab = {
  lastTab: string | null;
  setLastTab: (tab: string) => void;
};

const SESSION_NAMESPACE = 'freeform-builder-tabs';

const getSessionTabs = (formId: string): Tabs => {
  const storedTabs = JSON.parse(
    sessionStorage.getItem(SESSION_NAMESPACE) || '{}'
  );

  return storedTabs[formId] || {};
};

const setSessionTabs = (formId: string, tabs: Tabs): void => {
  const previousState = JSON.parse(
    sessionStorage.getItem(SESSION_NAMESPACE) || '{}'
  );

  sessionStorage.setItem(
    SESSION_NAMESPACE,
    JSON.stringify({ ...previousState, [formId]: tabs })
  );
};

export const useLastTab = (namespace: string): LastTab => {
  const { formId } = useParams();
  const [tabs, setTabs] = useState<Tabs>(getSessionTabs(formId));

  useEffect(() => {
    setSessionTabs(formId, tabs);
  }, [formId, tabs]);

  const setLastTab = (tab: string): void => {
    setTabs((prev) => ({ ...prev, [namespace]: tab }));
  };

  return {
    lastTab: tabs[namespace] || null,
    setLastTab,
  };
};
