"use client";

import type { ManifestCaptchaSecurity } from "@solspace/freeform-core";
import { useEffect, useRef } from "react";
import type { FreeformRuntime } from "../types.js";

type CaptchaHostProps = {
  form: FreeformRuntime;
  captcha: ManifestCaptchaSecurity;
};

function captchaIdentity(captcha: ManifestCaptchaSecurity): string {
  return [
    captcha.name,
    captcha.provider ?? "",
    captcha.siteKey ?? "",
    captcha.startMode ?? "",
    captcha.theme ?? "",
    captcha.locale ?? "",
    captcha.apiEndpoint ?? "",
    captcha.version ?? "",
    captcha.size ?? "",
  ].join("|");
}

export function CaptchaHost({ form, captcha }: CaptchaHostProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mountCaptchaRef = useRef(form.mountCaptcha);
  const captchaRef = useRef(captcha);
  mountCaptchaRef.current = form.mountCaptcha;
  captchaRef.current = captcha;

  const identity = captchaIdentity(captcha);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `identity` is the remount key; mount uses refs so captcha widgets are not torn down every render.
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    return mountCaptchaRef.current(captchaRef.current, element);
  }, [identity]);

  return (
    <div
      ref={ref}
      className="ff-captcha"
      data-freeform-captcha={captcha.name}
      data-freeform-captcha-provider={captcha.provider ?? captcha.name}
    />
  );
}
