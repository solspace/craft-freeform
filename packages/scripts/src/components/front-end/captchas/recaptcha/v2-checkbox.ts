import events from "@lib/plugin/constants/event-types";
import { addListeners } from "@lib/plugin/helpers/event-handling";
import type { FreeformEvent } from "types/events";
import { waitForToken } from "../common.script-loader";
import { getContainer, loadReCaptcha, readConfig } from "./utils/script-loader";

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let element = event.form.querySelector<HTMLDivElement>(".g-recaptcha");
  if (element) {
    return element;
  }

  element = document.createElement("div");
  element.classList.add("g-recaptcha");

  const { sitekey, theme, size } = readConfig(container);

  container.appendChild(element);

  grecaptcha.ready(() => {
    const captchaId = grecaptcha.render(element, {
      sitekey,
      theme,
      size,
    });

    element.dataset.captchaId = String(captchaId);
  });

  return element;
};

// Before the form submits, make sure the reCAPTCHA script has loaded, the widget has rendered and a token has been generated.
document.addEventListener(events.form.submit, (event: FreeformEvent) => {
  const container = getContainer(event.form);
  if (!container || event.isBackButtonPressed) {
    return;
  }

  event.addCallback(async () => {
    try {
      // Force-load the script regardless of lazy-load setting. If it is already loaded this resolves immediately.
      await loadReCaptcha(event.form, true);
    } catch {
      // Script failed to load - blocked by a browser extension, firewall, etc. Allow the submission to continue and the server validation checks will show an error to the user rather than sending the submission to spam.
      return;
    }

    // Render the widget
    createCaptcha(event);

    // Wait for token
    await waitForToken(event.form, "g-recaptcha-response");
  });
});

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadReCaptcha(event.form)
    .then(() => {
      createCaptcha(event);
    })
    .catch(() => {});
});

addListeners(
  document,
  [events.form.ajaxAfterSubmit],
  async (event: FreeformEvent) => {
    loadReCaptcha(event.form, true)
      .then(() => {
        const element = createCaptcha(event);
        if (element) {
          const id = element.dataset.captchaId;
          grecaptcha.ready(() => grecaptcha.reset(id ? Number(id) : undefined));
        }
      })
      .catch(() => {});
  },
);
