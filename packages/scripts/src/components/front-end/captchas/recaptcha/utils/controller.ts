import events from "@lib/plugin/constants/event-types";
import type { FreeformEvent } from "types/events";
import {
  loadRecaptcha,
  type RecaptchaApi,
  type RecaptchaConfig,
  withRecaptchaTimeout,
} from "../../../../../../../frontend/extensions/src/captchas/recaptcha-loader";

type State = {
  api: RecaptchaApi;
  widgetId?: number;
  resolve?: (token: string) => void;
  reject?: (error: Error) => void;
};

export function registerRecaptcha(version: string): void {
  const states = new WeakMap<HTMLFormElement, Promise<State>>();
  const lazyForms = new WeakSet<HTMLFormElement>();
  const containerFor = (form: HTMLFormElement) => {
    const container = form.querySelector<HTMLElement>(
      '[data-captcha="recaptcha"]',
    );
    return container && (container.dataset.version || "v2-checkbox") === version
      ? container
      : null;
  };
  const setToken = (form: HTMLFormElement, token: string) => {
    let fields = Array.from(
      form.querySelectorAll<HTMLTextAreaElement>(
        '[name="g-recaptcha-response"]',
      ),
    );
    if (!fields.length) {
      const field = document.createElement("textarea");
      field.name = "g-recaptcha-response";
      field.hidden = true;
      containerFor(form)?.appendChild(field);
      fields = [field];
    }
    for (const field of fields) field.value = token;
  };
  const initialize = (form: HTMLFormElement): Promise<State> => {
    const current = states.get(form);
    if (current) return current;
    const container = containerFor(form)!;
    const config: RecaptchaConfig = {
      siteKey: container.dataset.sitekey || "",
      version,
      verificationMode: container.dataset.verificationMode,
      scriptDomain: container.dataset.scriptDomain,
      locale: container.dataset.locale,
    };
    const loading = loadRecaptcha(config)
      .then((api) => {
        const state: State = { api };
        if (version !== "v3") {
          const widget = document.createElement("div");
          widget.dataset.recaptcha = "";
          if (version === "v2-checkbox") widget.className = "g-recaptcha";
          container.appendChild(widget);
          try {
            state.widgetId = api.render(widget, {
              sitekey: config.siteKey,
              theme: container.dataset.theme || "light",
              size:
                version === "v2-invisible"
                  ? "invisible"
                  : container.dataset.size || "normal",
              callback: (token: string) => {
                setToken(form, token);
                state.resolve?.(token);
              },
              "expired-callback": () => {
                setToken(form, "");
                state.reject?.(new Error("reCAPTCHA challenge expired."));
              },
              "error-callback": () => {
                setToken(form, "");
                state.reject?.(new Error("reCAPTCHA challenge failed."));
              },
            });
          } catch (error) {
            widget.remove();
            throw error;
          }
        }
        return state;
      })
      .catch((error) => {
        states.delete(form);
        throw error;
      });
    states.set(form, loading);
    return loading;
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
    const container = containerFor(event.form);
    if (!container || event.isBackButtonPressed) return;
    event.addCallback(async () => {
      try {
        if (version === "v3") setToken(event.form, "");
        const state = await initialize(event.form);
        if (version === "v3") {
          const token = await withRecaptchaTimeout(
            Promise.resolve(
              state.api.execute(container.dataset.sitekey || "", {
                action: container.dataset.action || "submit",
              }),
            ),
          );
          if (!token) throw new Error("reCAPTCHA returned no token.");
          setToken(event.form, token);
        } else {
          const existing = state.api.getResponse(state.widgetId);
          if (existing) {
            setToken(event.form, existing);
            return;
          }
          setToken(event.form, "");
          const token = new Promise<string>((resolve, reject) => {
            state.resolve = resolve;
            state.reject = reject;
          });
          try {
            if (version === "v2-invisible")
              Promise.resolve(state.api.execute(state.widgetId!)).catch(
                (error) => state.reject?.(error),
              );
            setToken(
              event.form,
              await withRecaptchaTimeout(
                token,
                version === "v2-invisible" ? 120000 : 8000,
              ),
            );
          } finally {
            state.resolve = undefined;
            state.reject = undefined;
          }
        }
      } catch {
        // An unavailable challenge must produce a normal missing-token error on
        // the server, never reuse an earlier token or leave the form waiting.
        setToken(event.form, "");
      }
    });
  });
  const reset = (event: FreeformEvent) => {
    if (!containerFor(event.form)) return;
    const loading = states.get(event.form);
    if (!loading) return;
    void loading
      .then((state) => {
        setToken(event.form, "");
        if (state.widgetId !== undefined) state.api.reset(state.widgetId);
      })
      .catch(() => {});
  };
  document.addEventListener(events.form.ajaxAfterSubmit, reset);
  document.addEventListener(events.form.afterFailedSubmit, reset);
}
