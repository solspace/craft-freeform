import events from "@lib/plugin/constants/event-types";
import { addListeners } from "@lib/plugin/helpers/event-handling";
import type { FreeformEvent } from "types/events";
import { waitForToken } from "../common.script-loader";
import { getContainer, loadCaptcha, readConfig } from "./utils/script-loader";

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let element = event.form.querySelector<HTMLDivElement>(".cl-turnstile");
  if (element) {
    return element;
  }

  element = document.createElement("div");
  element.classList.add("cl-turnstile");

  container.appendChild(element);

  const { sitekey, theme, size, action } = readConfig(container);
  // @ts-expect-error
  const captchaId = turnstile.render(element, {
    sitekey,
    theme,
    size,
    action,
  });

  element.dataset.captchaId = String(captchaId);

  return element;
};

// Before the form submits, make sure the Turnstile script has loaded, the widget has rendered and a token has been generated.
document.addEventListener(events.form.submit, (event: FreeformEvent) => {
  const container = getContainer(event.form);
  if (!container || event.isBackButtonPressed) {
    return;
  }

  event.addCallback(async () => {
    try {
      // Force-load the script regardless of lazy-load setting. If it is already loaded this resolves immediately.
      await loadCaptcha(event.form, true);
    } catch {
      // Script failed to load - blocked by a browser extension, firewall, etc. Allow the submission to continue and the server validation checks will show an error to the user rather than sending the submission to spam.
      return;
    }

    // Render the widget
    createCaptcha(event);

    // Wait for token
    await waitForToken(event.form, "cf-turnstile-response");
  });
});

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadCaptcha(event.form)
    .then(() => {
      createCaptcha(event);
    })
    .catch(() => {});
});

addListeners(
  document,
  [events.form.ajaxAfterSubmit],
  async (event: FreeformEvent) => {
    loadCaptcha(event.form, true)
      .then(() => {
        const element = createCaptcha(event);
        if (element) {
          const id = element.dataset.captchaId;
          if (id) {
            // @ts-expect-error
            turnstile.reset(id);
          }
        }
      })
      .catch(() => {});
  },
);
