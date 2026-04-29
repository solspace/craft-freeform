import events from "@lib/plugin/constants/event-types";
import { addListeners } from "@lib/plugin/helpers/event-handling";
import type { FreeformEvent } from "types/events";
import { waitForToken } from "../common.script-loader";
import { getContainer, loadHCaptcha, readConfig } from "./utils/script-loader";

let captchaId: string;

const createCaptcha = (event: FreeformEvent): HTMLDivElement | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  const existingElement = container.querySelector<HTMLDivElement>(".h-captcha");
  if (existingElement) {
    return existingElement;
  }

  const captchaElement = document.createElement("div");
  captchaElement.classList.add("h-captcha");

  const { sitekey, theme, size } = readConfig(container);

  container.appendChild(captchaElement);
  captchaId = hcaptcha.render(captchaElement, {
    sitekey,
    theme,
    size,
  });

  return captchaElement;
};

// Before the form submits, make sure the hCaptcha script has loaded, the widget has rendered and a token has been generated.
document.addEventListener(events.form.submit, (event: FreeformEvent) => {
  const container = getContainer(event.form);
  if (!container || event.isBackButtonPressed) {
    return;
  }

  event.addCallback(async () => {
    try {
      // Force-load the script regardless of lazy-load setting. If it is already loaded this resolves immediately.
      await loadHCaptcha(event.form, true);
    } catch {
      // Script failed to load - blocked by a browser extension, firewall, etc. Allow the submission to continue and the server validation checks will show an error to the user rather than sending the submission to spam.
      return;
    }

    // Render the widget
    createCaptcha(event);

    // Wait for token
    await waitForToken(event.form, "h-captcha-response");
  });
});

document.addEventListener(events.form.ready, (event: FreeformEvent) => {
  loadHCaptcha(event.form)
    .then(() => {
      createCaptcha(event);
    })
    .catch(() => {});
});

addListeners(
  document,
  [events.form.ajaxAfterSubmit],
  async (event: FreeformEvent) => {
    loadHCaptcha(event.form)
      .then(() => {
        const captchaElement = createCaptcha(event);
        if (captchaElement) {
          hcaptcha.reset(captchaId);
        }
      })
      .catch(() => {});
  },
);
