import events from "@lib/plugin/constants/event-types";
import type { FreeformEvent } from "types/events";
import { getContainer, loadHCaptcha, readConfig } from "./script-loader";

type WidgetId = string | number;
type State = {
  id: WidgetId;
  mount: HTMLElement;
  resolve?: (token: string) => void;
  reject?: () => void;
};
type Api = {
  render(element: HTMLElement, options: Record<string, unknown>): WidgetId;
  getResponse(id: WidgetId): string;
  execute(id: WidgetId): unknown;
  reset(id: WidgetId): void;
};
const api = () => hcaptcha as unknown as Api;

export function registerHcaptcha(version: string): void {
  const states = new WeakMap<HTMLFormElement, Promise<State>>();
  const lazyForms = new WeakSet<HTMLFormElement>();
  const containerFor = (form: HTMLFormElement) => {
    const container = getContainer(form);
    return container && (container.dataset.version || "invisible") === version
      ? container
      : null;
  };
  const setToken = (form: HTMLFormElement, token: string) => {
    let fields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        '[name="h-captcha-response"]',
      ),
    );
    if (!fields.length) {
      const field = document.createElement("textarea");
      field.name = "h-captcha-response";
      field.hidden = true;
      containerFor(form)?.appendChild(field);
      fields = [field];
    }
    for (const field of fields) field.value = token;
  };
  const initialize = (form: HTMLFormElement): Promise<State> => {
    const existing = states.get(form);
    if (existing) return existing;
    const promise = loadHCaptcha(form)
      .then(() => {
        const container = containerFor(form)!;
        const config = readConfig(container);
        const mount = document.createElement("div");
        mount.className = "h-captcha";
        container.appendChild(mount);
        const state: State = { id: "", mount };
        const failed = () => {
          setToken(form, "");
          state.reject?.();
        };
        try {
          state.id = api().render(mount, {
            sitekey: config.sitekey,
            theme: config.theme,
            size: version === "invisible" ? "invisible" : config.size,
            hl: config.locale || undefined,
            callback: (token: string) => {
              setToken(form, token);
              state.resolve?.(token);
            },
            "expired-callback": failed,
            "error-callback": failed,
            "chalexpired-callback": failed,
            "close-callback": failed,
          });
        } catch (error) {
          mount.remove();
          throw error;
        }
        return state;
      })
      .catch((error) => {
        states.delete(form);
        throw error;
      });
    states.set(form, promise);
    return promise;
  };
  document.addEventListener(events.form.ready, (event: FreeformEvent) => {
    const container = containerFor(event.form);
    if (!container) return;
    const load = () => {
      void initialize(event.form).catch(() => {});
    };
    if (container.hasAttribute("data-lazy-load")) {
      if (!lazyForms.has(event.form)) {
        lazyForms.add(event.form);
        event.form.addEventListener("input", load, { once: true });
      }
    } else load();
  });
  document.addEventListener(events.form.submit, (event: FreeformEvent) => {
    if (!containerFor(event.form) || event.isBackButtonPressed) return;
    event.addCallback(async () => {
      try {
        const state = await initialize(event.form);
        const existing = api().getResponse(state.id);
        if (existing) {
          setToken(event.form, existing);
          return;
        }
        setToken(event.form, "");
        let timeout: ReturnType<typeof setTimeout> | undefined;
        try {
          const token = new Promise<string>((resolve, reject) => {
            state.resolve = resolve;
            state.reject = () =>
              reject(new Error("hCaptcha could not be completed."));
            timeout = setTimeout(
              state.reject,
              version === "invisible" ? 120000 : 8000,
            );
          });
          if (version === "invisible") {
            Promise.resolve(api().execute(state.id)).catch(() =>
              state.reject?.(),
            );
          }
          setToken(event.form, await token);
        } finally {
          clearTimeout(timeout);
          state.resolve = undefined;
          state.reject = undefined;
        }
      } catch {
        setToken(event.form, "");
      }
    });
  });
  const reset = (event: FreeformEvent) => {
    if (!containerFor(event.form)) return;
    void states
      .get(event.form)
      ?.then((state) => {
        setToken(event.form, "");
        api().reset(state.id);
      })
      .catch(() => {});
  };
  document.addEventListener(events.form.ajaxAfterSubmit, reset);
  document.addEventListener(events.form.afterFailedSubmit, reset);
}
