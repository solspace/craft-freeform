type CaptchaScriptPolicy = { createScriptURL(value: string): unknown };
type CaptchaScriptWindow = Window & {
  __freeformCaptchaScriptPolicy?: CaptchaScriptPolicy;
  trustedTypes?: {
    createPolicy(
      name: string,
      rules: { createScriptURL(value: string): string },
    ): CaptchaScriptPolicy;
  };
};

// Keep the existing policy name for sites that already allow it in CSP, and
// share its handle across the separately bundled captcha integrations.
export function captchaScriptUrl(url: string): string {
  const host = window as CaptchaScriptWindow;
  if (!host.trustedTypes?.createPolicy) return url;
  host.__freeformCaptchaScriptPolicy ??= host.trustedTypes.createPolicy(
    "freeform#captcha-loader",
    {
      createScriptURL: (value) => value,
    },
  );
  return host.__freeformCaptchaScriptPolicy.createScriptURL(url) as string;
}
