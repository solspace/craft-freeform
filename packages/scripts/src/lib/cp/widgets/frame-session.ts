type AuthManager = {
  checkRemainingSessionTime(): Promise<void> | void;
  checkRemainingSessionTimer?: number;
  decrementLogoutWarningInterval?: number;
  hideLogoutWarningModal?(quick: boolean): void;
  hideLoginModal?(quick: boolean): void;
  trigger?(event: string): void;
};
type FrameCraft = {
  remainingSessionTime: number;
  csrfTokenName?: string;
  csrfTokenValue?: string;
  cp?: { authManager?: AuthManager | null };
  AuthManager?: object;
  sendActionRequest?: (...args: unknown[]) => Promise<unknown>;
};
type GarnishEvents = {
  on(target: object, event: string, handler: () => void): void;
  off(target: object, event: string, handler: () => void): void;
};
const craftIn = (frame: Window) =>
  (frame as unknown as { Craft?: FrameCraft }).Craft;
const eventsIn = (frame: Window) =>
  (frame as unknown as { Garnish?: GarnishEvents }).Garnish;

export function getWidgetFrameHost(frame: Window = window): Window | null {
  try {
    const host = frame.parent;
    if (
      host !== frame &&
      host.location.origin === frame.location.origin &&
      frame.frameElement?.hasAttribute("data-freeform-widget-frame") &&
      craftIn(host)?.cp
    )
      return host;
  } catch {
    /* Foreign-origin frames retain their own UI. */
  }
  return null;
}

/** Embedded widgets use the host's authentication timer and login UI. */
export function manageWidgetFrameSession(frame: Window = window) {
  const host = getWidgetFrameHost(frame);
  if (!host || !craftIn(frame)) return;
  const craft = craftIn(frame)!;
  let dispose = () => {};
  let connected = false;
  let frameAuth: AuthManager | undefined;
  const connect = () => {
    if (connected) return;
    connected = true;
    const parentCraft = craftIn(host)!;
    const localAuth = craft.cp?.authManager;
    if (localAuth && localAuth !== parentCraft.cp?.authManager) {
      frameAuth = localAuth;
      frame.clearTimeout(localAuth.checkRemainingSessionTimer);
      frame.clearInterval(localAuth.decrementLogoutWarningInterval);
      localAuth.hideLogoutWarningModal?.(true);
      localAuth.hideLoginModal?.(true);
    }
    if (craft.cp) craft.cp.authManager = parentCraft.cp?.authManager;
    const syncTokens = () => {
      if (craft.remainingSessionTime !== parentCraft.remainingSessionTime)
        craft.remainingSessionTime = parentCraft.remainingSessionTime;
      if (!parentCraft.csrfTokenName || !parentCraft.csrfTokenValue) return;
      if (craft.csrfTokenName !== parentCraft.csrfTokenName)
        craft.csrfTokenName = parentCraft.csrfTokenName;
      if (craft.csrfTokenValue !== parentCraft.csrfTokenValue)
        craft.csrfTokenValue = parentCraft.csrfTokenValue;
      for (const input of frame.document.querySelectorAll<HTMLInputElement>(
        'input[type="hidden"]',
      )) {
        if (
          input.name === craft.csrfTokenName &&
          input.value !== craft.csrfTokenValue
        )
          input.value = craft.csrfTokenValue;
      }
    };
    syncTokens();
    const send = craft.sendActionRequest;
    const sendFromFrame: FrameCraft["sendActionRequest"] = async (...args) => {
      syncTokens();
      try {
        return await send!.apply(craft, args);
      } catch (error) {
        if (
          (error as { response?: { status?: number } })?.response?.status ===
          401
        ) {
          void parentCraft.cp?.authManager?.checkRemainingSessionTime();
        }
        throw error;
      }
    };
    if (send) craft.sendActionRequest = sendFromFrame;
    const events = eventsIn(host);
    const handleLogin = () => {
      syncTokens();
      // Resume Craft operations waiting on this document's login event as well.
      frameAuth?.trigger?.("login");
    };
    if (events && parentCraft.AuthManager)
      events.on(parentCraft.AuthManager, "login", handleLogin);
    frame.document.addEventListener("submit", syncTokens, true);
    frame.document.addEventListener("focusin", syncTokens);
    dispose = () => {
      connected = false;
      if (send && craft.sendActionRequest === sendFromFrame)
        craft.sendActionRequest = send;
      if (events && parentCraft.AuthManager)
        events.off(parentCraft.AuthManager, "login", handleLogin);
      frame.document.removeEventListener("submit", syncTokens, true);
      frame.document.removeEventListener("focusin", syncTokens);
    };
  };
  if (craft.cp) connect();
  else
    frame.document.addEventListener("DOMContentLoaded", connect, {
      once: true,
    });
  frame.addEventListener("pagehide", () => {
    frame.document.removeEventListener("DOMContentLoaded", connect);
    dispose();
  });
  frame.addEventListener("pageshow", (event) => {
    if ((event as PageTransitionEvent).persisted) connect();
  });
}
