type VoidPromise = Promise<void>;

const sendAction = (action: string): Promise<Response> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CraftAny = (window as unknown as any).Craft;

  if (CraftAny?.sendActionRequest) {
    return CraftAny.sendActionRequest('POST', action);
  }

  return fetch(`/actions/${action}`, {
    method: 'POST',
    credentials: 'same-origin',
  });
};

export const disableFormMonitor = (): VoidPromise =>
  sendAction('freeform/form-monitor/disable-me').then(() => {});

export const disableAndDeleteFormMonitor = (): VoidPromise =>
  sendAction('freeform/form-monitor/delete-me').then(() => {});
