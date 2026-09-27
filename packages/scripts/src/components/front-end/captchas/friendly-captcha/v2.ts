import {
  FRCWidgetExpireEventName,
  FriendlyCaptchaSDK,
} from "@friendlycaptcha/sdk";
import events from "@lib/plugin/constants/event-types";
import { addListeners } from "@lib/plugin/helpers/event-handling";
import type { FreeformEvent } from "types/events";
import { waitForToken } from "../common.script-loader";
import {
  getContainer,
  loadCaptcha,
  readFriendlyCaptchaConfig,
} from "./utils/script-loader";

const FIELD_NAME = "frc-captcha-response";

type WidgetHandle = ReturnType<FriendlyCaptchaSDK["createWidget"]>;

let sdkSingleton: FriendlyCaptchaSDK | null = null;

const widgetByMount = new WeakMap<HTMLElement, WidgetHandle>();

function getSdk(): FriendlyCaptchaSDK {
  if (!sdkSingleton) {
    sdkSingleton = new FriendlyCaptchaSDK({ apiEndpoint: "global" });
  }

  return sdkSingleton;
}

function attachExpireListener(mount: HTMLElement, handle: WidgetHandle): void {
  if (mount.dataset.frcExpireBound === "1") {
    return;
  }

  mount.dataset.frcExpireBound = "1";

  mount.addEventListener(FRCWidgetExpireEventName, () => {
    try {
      handle.reset();
    } catch {
      /* Widget may be destroyed */
    }
  });
}

const createCaptcha = (event: FreeformEvent): WidgetHandle | null => {
  const container = getContainer(event.form);
  if (!container) {
    return null;
  }

  let mount = container.querySelector<HTMLElement>(".freeform-frc-mount");
  if (!mount) {
    mount = document.createElement("div");
    mount.classList.add("freeform-frc-mount");
    container.appendChild(mount);
  }

  let handle = widgetByMount.get(mount);
  if (handle) {
    return handle;
  }

  const cfg = readFriendlyCaptchaConfig(container);
  const sdk = getSdk();

  const opts: Parameters<FriendlyCaptchaSDK["createWidget"]>[0] = {
    element: mount,
    sitekey: cfg.sitekey,
    startMode: cfg.startMode as "auto" | "focus" | "none",
    theme: cfg.theme as "light" | "dark" | "auto",
    apiEndpoint: cfg.apiEndpoint,
    formFieldName: FIELD_NAME,
  };

  if (cfg.language) {
    opts.language = cfg.language;
  }

  handle = sdk.createWidget(opts);
  widgetByMount.set(mount, handle);
  attachExpireListener(mount, handle);

  return handle;
};

async function ensureCaptchaToken(event: FreeformEvent): Promise<void> {
  try {
    await loadCaptcha(event.form, true);
  } catch {
    return;
  }

  const handle = createCaptcha(event);
  if (!handle) {
    return;
  }

  await waitForToken(event.form, FIELD_NAME);

  const input = event.form.querySelector<HTMLInputElement>(
    `[name="${FIELD_NAME}"]`,
  );

  if (input?.value) {
    return;
  }

  try {
    handle.reset();
  } catch {
    /* ignore */
  }

  await waitForToken(event.form, FIELD_NAME);
}

document.addEventListener(events.form.submit, (event: FreeformEvent) => {
  const container = getContainer(event.form);
  if (!container || event.isBackButtonPressed) {
    return;
  }

  event.addCallback(async () => {
    await ensureCaptchaToken(event);
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
        const handle = createCaptcha(event);
        const container = getContainer(event.form);
        const mount = container?.querySelector<HTMLElement>(
          ".freeform-frc-mount",
        );
        if (handle && mount) {
          try {
            handle.reset();
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {});
  },
);
