const providers: Record<string, string> = {
  "Solspace\\Freeform\\Integrations\\Captchas\\ReCaptcha\\ReCaptcha":
    "recaptcha",
  "Solspace\\Freeform\\Integrations\\Captchas\\hCaptcha\\hCaptcha": "hcaptcha",
  "Solspace\\Freeform\\Integrations\\Captchas\\Turnstile\\Turnstile":
    "turnstile",
  "Solspace\\Freeform\\Integrations\\Captchas\\FriendlyCaptcha\\FriendlyCaptcha":
    "friendly-captcha",
};

export function captchaProvider(className: string): string | undefined {
  return Object.hasOwn(providers, className) ? providers[className] : undefined;
}
