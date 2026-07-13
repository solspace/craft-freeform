import type { FreeformManifest, SubmitMeta } from "@solspace/freeform-core";

export function buildSecurityMeta(manifest: FreeformManifest): SubmitMeta {
  const meta: SubmitMeta = {};

  if (manifest.security.honeypot?.name) {
    meta.honeypot = {
      name: manifest.security.honeypot.name,
      value: "",
    };
  }

  if (manifest.security.javascriptTest?.name) {
    meta.javascriptTest = {
      name: manifest.security.javascriptTest.name,
      value: manifest.security.javascriptTest.value ?? "",
    };
  }

  return meta;
}
