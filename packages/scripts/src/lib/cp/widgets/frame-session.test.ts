import { describe, expect, it, vi } from "vitest";
import { manageWidgetFrameSession } from "./frame-session";

function fixture() {
  const authManager = {
    checkRemainingSessionTime: vi.fn().mockResolvedValue(undefined),
  };
  const parentCraft = {
    remainingSessionTime: 1800,
    csrfTokenName: "CRAFT_CSRF_TOKEN",
    csrfTokenValue: "host-token",
    cp: { authManager },
    AuthManager: {},
  };
  const parentEvents = { on: vi.fn(), off: vi.fn() };
  const host = {
    location: { origin: "https://craft.test" },
    Craft: parentCraft,
    Garnish: parentEvents,
  };
  const doc = document.implementation.createHTMLDocument();
  doc.body.innerHTML =
    '<form><input type="hidden" name="CRAFT_CSRF_TOKEN" value="old-token"><input name="title" value="Unsaved settings"><input type="hidden" name="other" value="keep"></form>';
  const element = document.createElement("iframe");
  element.setAttribute("data-freeform-widget-frame", "");
  const sendActionRequest = vi.fn().mockResolvedValue({ data: "success" });
  const craft = {
    remainingSessionTime: 1800,
    csrfTokenName: "CRAFT_CSRF_TOKEN",
    csrfTokenValue: "old-token",
    cp: { authManager: null as unknown },
    AuthManager: {},
    sendActionRequest,
  };
  const frame = Object.assign(new EventTarget(), {
    parent: host,
    document: doc,
    frameElement: element,
    location: { origin: "https://craft.test" },
    Craft: craft,
    Garnish: { trigger: vi.fn() },
    clearTimeout: vi.fn(),
    clearInterval: vi.fn(),
  });
  const start = () => manageWidgetFrameSession(frame as unknown as Window);
  const ready = () => doc.dispatchEvent(new Event("DOMContentLoaded"));
  return {
    frame,
    craft,
    host,
    parentCraft,
    parentEvents,
    doc,
    sendActionRequest,
    authManager,
    start,
    ready,
  };
}

describe("dashboard widget frame authentication", () => {
  it("stops the frame timer and shares the host login UI", () => {
    const f = fixture();
    const localAuth = {
      checkRemainingSessionTimer: 17,
      decrementLogoutWarningInterval: 19,
      hideLogoutWarningModal: vi.fn(),
      hideLoginModal: vi.fn(),
    };
    f.craft.cp.authManager = localAuth;
    f.start();
    expect(f.frame.clearTimeout).toHaveBeenCalledWith(17);
    expect(f.frame.clearInterval).toHaveBeenCalledWith(19);
    expect(localAuth.hideLogoutWarningModal).toHaveBeenCalledWith(true);
    expect(localAuth.hideLoginModal).toHaveBeenCalledWith(true);
    expect(f.parentCraft.remainingSessionTime).toBe(1800);
    f.ready();
    expect(f.craft.cp.authManager).toBe(f.authManager);
    expect(f.parentEvents.on).toHaveBeenCalledWith(
      f.parentCraft.AuthManager,
      "login",
      expect.any(Function),
    );
  });

  it("leaves standalone, unmarked, and foreign-origin documents with normal Craft authentication", () => {
    for (const mode of ["standalone", "unmarked", "foreign"]) {
      const f = fixture();
      if (mode === "standalone")
        f.frame.parent = f.frame as unknown as typeof f.host;
      if (mode === "unmarked")
        f.frame.frameElement.removeAttribute("data-freeform-widget-frame");
      if (mode === "foreign")
        Object.defineProperty(f.host, "location", {
          get() {
            throw new DOMException("Cross origin");
          },
        });
      f.start();
      f.ready();
      expect(f.craft.remainingSessionTime).toBe(1800);
      expect(f.craft.cp.authManager).toBeNull();
      expect(f.parentEvents.on).not.toHaveBeenCalled();
    }
  });

  it("updates request and form tokens after host reauthentication without losing unsaved values", async () => {
    const f = fixture();
    const frameAuth = { trigger: vi.fn() };
    f.craft.cp.authManager = frameAuth;
    f.start();
    f.ready();
    f.parentCraft.csrfTokenValue = "renewed-token";
    const login = f.parentEvents.on.mock.calls[0][2];
    login();
    expect(f.craft.csrfTokenValue).toBe("renewed-token");
    expect(
      f.doc.querySelector<HTMLInputElement>('input[name="CRAFT_CSRF_TOKEN"]')!
        .value,
    ).toBe("renewed-token");
    expect(
      f.doc.querySelector<HTMLInputElement>('input[name="title"]')!.value,
    ).toBe("Unsaved settings");
    expect(
      f.doc.querySelector<HTMLInputElement>('input[name="other"]')!.value,
    ).toBe("keep");
    expect(frameAuth.trigger).toHaveBeenCalledWith("login");
    f.parentCraft.csrfTokenValue = "latest-token";
    await f.craft.sendActionRequest("POST", "freeform/widgets/refresh", {
      data: { widgetId: 8 },
    });
    expect(f.craft.csrfTokenValue).toBe("latest-token");
    expect(f.sendActionRequest).toHaveBeenCalledExactlyOnceWith(
      "POST",
      "freeform/widgets/refresh",
      { data: { widgetId: 8 } },
    );
    f.parentCraft.csrfTokenValue = "submit-token";
    f.doc
      .querySelector("form")!
      .dispatchEvent(new Event("submit", { bubbles: true }));
    expect(
      f.doc.querySelector<HTMLInputElement>('input[name="CRAFT_CSRF_TOKEN"]')!
        .value,
    ).toBe("submit-token");
  });

  it("routes an expired request to host authentication and preserves the rejection for retry", async () => {
    const f = fixture();
    f.start();
    f.ready();
    const error = { response: { status: 401 } };
    f.sendActionRequest.mockRejectedValueOnce(error);
    await expect(
      f.craft.sendActionRequest("POST", "freeform/widgets/refresh"),
    ).rejects.toBe(error);
    expect(f.authManager.checkRemainingSessionTime).toHaveBeenCalledOnce();
    f.sendActionRequest.mockRejectedValueOnce({ response: { status: 500 } });
    await expect(
      f.craft.sendActionRequest("POST", "freeform/widgets/refresh"),
    ).rejects.toBeDefined();
    expect(f.authManager.checkRemainingSessionTime).toHaveBeenCalledOnce();
  });

  it("removes host listeners when a frame unloads and allows a fresh frame to reconnect", () => {
    const f = fixture();
    f.start();
    f.ready();
    f.frame.dispatchEvent(new Event("pagehide"));
    expect(f.parentEvents.off).toHaveBeenCalledWith(
      ...f.parentEvents.on.mock.calls[0],
    );
    expect(f.craft.sendActionRequest).toBe(f.sendActionRequest);
    const next = fixture();
    next.start();
    next.ready();
    expect(next.craft.cp.authManager).toBe(next.authManager);
  });

  it("does not connect a frame that was removed before CP finished loading", () => {
    const f = fixture();
    f.craft.cp = undefined as unknown as typeof f.craft.cp;
    f.start();
    f.frame.dispatchEvent(new Event("pagehide"));
    f.ready();
    expect(f.parentEvents.on).not.toHaveBeenCalled();
  });
  it("reconnects after a browser Back/Forward cache restoration", () => {
    const f = fixture();
    f.start();
    f.ready();
    f.frame.dispatchEvent(new Event("pagehide"));
    f.parentCraft.csrfTokenValue = "restored-token";
    const event = new Event("pageshow");
    Object.defineProperty(event, "persisted", { value: true });
    f.frame.dispatchEvent(event);
    expect(f.parentEvents.on).toHaveBeenCalledTimes(2);
    expect(f.craft.csrfTokenValue).toBe("restored-token");
    expect(f.craft.cp.authManager).toBe(f.authManager);
    f.frame.dispatchEvent(new Event("pagehide"));
    expect(f.parentEvents.off).toHaveBeenCalledTimes(2);
  });
  it("does not create an auth manager for a host with an unlimited session", () => {
    const f = fixture();
    f.parentCraft.remainingSessionTime = 0;
    f.parentCraft.cp.authManager = null as unknown as typeof f.authManager;
    f.start();
    f.ready();
    expect(f.craft.remainingSessionTime).toBe(0);
    expect(f.craft.cp.authManager).toBeNull();
  });
  it("does not mutate unchanged CSRF inputs on repeated focus or requests", async () => {
    const f = fixture();
    f.start();
    f.ready();
    const mutations = vi.fn();
    const observer = new MutationObserver(mutations);
    observer.observe(f.doc.body, { attributes: true, subtree: true });
    f.doc.dispatchEvent(new Event("focusin"));
    await f.craft.sendActionRequest("GET", "users/session-info");
    await Promise.resolve();
    expect(mutations).not.toHaveBeenCalled();
    observer.disconnect();
  });
});
