import type { ExtensionSubmitContext } from "@solspace/freeform-core";
import { expect, it } from "vitest";
import { signatureJpeg, signaturePng } from "../../../test/signature-images.js";
import { signatureManifest } from "../../../test/signature-manifest.js";
import { createSignatureExtension } from "./index.js";

function submit(
  value: unknown,
  intent: ExtensionSubmitContext["intent"] = "submit",
) {
  return createSignatureExtension().beforeSubmit!({
    manifest: signatureManifest,
    values: { signature: value },
    intent,
    meta: {},
  });
}

it("prevents submitting an untouched required field or malformed image", async () => {
  await expect(submit("")).rejects.toThrow("Signature is required");
  await expect(
    submit(`data:image/png;base64,${"A".repeat(200)}`),
  ).rejects.toThrow("Signature is required");
});

it.each([signaturePng, signatureJpeg])(
  "preserves submission of existing images",
  async (value) => {
    await expect(submit(value)).resolves.toBeUndefined();
  },
);

it.each(["back", "validate"] as const)(
  "preserves %s navigation without a signature",
  async (intent) => {
    await expect(submit("", intent)).resolves.toBeUndefined();
  },
);
