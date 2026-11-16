const eventName = "freeform:dark-mode-tip-dismissed";
const storagePrefix = "freeform:dark-mode-tip:";
const dismissedUsers = new Set<string>();

export function isDarkModeTipDismissed(userKey: string): boolean {
  if (dismissedUsers.has(userKey)) return true;
  try {
    // Ignore old transport messages after a fresh server-rendered page load.
    const timestamp = Number(
      localStorage.getItem(`${storagePrefix}${userKey}`)?.split(":")[0],
    );
    return timestamp > performance.timeOrigin;
  } catch {
    return false;
  }
}

/** Storage only transports successful dismissals; the account remains authoritative. */
export function subscribeDarkModeTip(
  userKey: string,
  onDismiss: () => void,
): () => void {
  const dismiss = () => {
    dismissedUsers.add(userKey);
    onDismiss();
  };
  const onEvent = (event: Event) => {
    if ((event as CustomEvent<string>).detail === userKey) dismiss();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === `${storagePrefix}${userKey}` && event.newValue) dismiss();
  };
  window.addEventListener(eventName, onEvent);
  window.addEventListener("storage", onStorage);
  if (isDarkModeTipDismissed(userKey)) onDismiss();
  return () => {
    window.removeEventListener(eventName, onEvent);
    window.removeEventListener("storage", onStorage);
  };
}

export async function dismissDarkModeTip(
  userKey: string,
  save: () => Promise<unknown>,
): Promise<void> {
  await save();
  dismissedUsers.add(userKey);
  window.dispatchEvent(new CustomEvent(eventName, { detail: userKey }));
  try {
    localStorage.setItem(
      `${storagePrefix}${userKey}`,
      `${Date.now()}:${Math.random()}`,
    );
  } catch {
    // Dismissal is already saved even when this browser blocks local storage.
  }
}
