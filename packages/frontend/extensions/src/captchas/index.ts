import type { FreeformExtension } from "@solspace/freeform-core";
import { friendlyCaptchaExtension } from "./friendly-captcha.js";
import { hcaptchaExtension } from "./hcaptcha.js";
import { recaptchaExtension } from "./recaptcha.js";
import { turnstileExtension } from "./turnstile.js";

export {
  createFriendlyCaptchaExtension,
  friendlyCaptchaExtension,
} from "./friendly-captcha.js";
export { createHcaptchaExtension, hcaptchaExtension } from "./hcaptcha.js";
export { createRecaptchaExtension, recaptchaExtension } from "./recaptcha.js";
export {
  inferCaptchaProvider,
  loadScriptOnce,
  waitForValue,
} from "./shared.js";
export { createTurnstileExtension, turnstileExtension } from "./turnstile.js";

export const captchaExtensions: FreeformExtension[] = [
  turnstileExtension,
  recaptchaExtension,
  hcaptchaExtension,
  friendlyCaptchaExtension,
];
