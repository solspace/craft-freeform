import type {
  FreeformManifest,
  ManifestCaptchaSecurity,
  SubmitIntent,
} from "../types/manifest.js";
import type { SubmitMeta, SubmitResponse } from "../types/submit.js";

export type ExtensionSeverity = "error" | "warning";

export type ExtensionDescriptor = {
  name: string;
  package: string;
  version: string;
  severity: ExtensionSeverity;
  fallback?: string | null;
};

export type RequiredExtensionDescriptor = Omit<
  ExtensionDescriptor,
  "severity"
> & {
  severity: string;
};

export type ExtensionContext = {
  registerRenderer?: (fieldType: string, renderer: unknown) => void;
};

export type ExtensionSetupContext = {
  manifest: FreeformManifest;
};

export type ExtensionSubmitContext = {
  manifest: FreeformManifest;
  intent: SubmitIntent;
  values: Record<string, unknown>;
  meta: SubmitMeta;
};

export type ExtensionPayloadContext = ExtensionSubmitContext & {
  setMeta: (meta: Partial<SubmitMeta>) => void;
  setCaptchaToken: (name: string, value: string) => void;
};

export type ExtensionSubmitResultContext = {
  manifest: FreeformManifest;
  intent: SubmitIntent;
  response: SubmitResponse;
};

export type CaptchaMountContext = {
  manifest: FreeformManifest;
  captcha: ManifestCaptchaSecurity;
  element: HTMLElement;
};

export type FieldMountContext = {
  manifest: FreeformManifest;
  field: import("../types/manifest.js").ManifestFieldDefinition;
  element: HTMLElement;
  value: unknown;
  setValue: (value: unknown) => void;
  /** Craft / Freeform origin used to resolve relative API URLs */
  baseUrl?: string;
};

export type FreeformExtension = {
  name: string;
  version?: string;
  initialize?: (context: ExtensionContext) => void | Promise<void>;
  setup?: (context: ExtensionSetupContext) => void | Promise<void>;
  destroy?: () => void | Promise<void>;
  supports?: (
    field: import("../types/manifest.js").ManifestFieldDefinition,
  ) => boolean;
  mount?: (
    context: FieldMountContext,
  ) => void | (() => void) | Promise<undefined | (() => void)>;
  mountCaptcha?: (
    context: CaptchaMountContext,
  ) => void | (() => void) | Promise<undefined | (() => void)>;
  beforeSubmit?: (context: ExtensionSubmitContext) => void | Promise<void>;
  buildPayload?: (context: ExtensionPayloadContext) => void | Promise<void>;
  afterSubmit?: (context: ExtensionSubmitResultContext) => void | Promise<void>;
};

/** @deprecated Prefer FreeformExtension */
export type ExtensionModule = FreeformExtension;

export type ExtensionRegistry = {
  register: (extension: FreeformExtension) => void;
  get: (name: string) => FreeformExtension | undefined;
  list: () => FreeformExtension[];
  assertRequired: (required: RequiredExtensionDescriptor[]) => void;
};

export function createExtensionRegistry(): ExtensionRegistry {
  const extensions = new Map<string, FreeformExtension>();

  return {
    register(extension: FreeformExtension) {
      extensions.set(extension.name, extension);
    },

    get(name: string) {
      return extensions.get(name);
    },

    list() {
      return [...extensions.values()];
    },

    assertRequired(required: RequiredExtensionDescriptor[]) {
      for (const descriptor of required) {
        const installed = extensions.get(descriptor.name);
        if (!installed && descriptor.severity === "error") {
          throw new Error(
            `Required extension "${descriptor.name}" (${descriptor.package}) is not registered.`,
          );
        }
      }
    },
  };
}

export async function runExtensionSetups(
  extensions: FreeformExtension[],
  context: ExtensionSetupContext,
): Promise<void> {
  for (const extension of extensions) {
    await extension.setup?.(context);
  }
}

export async function collectExtensionSubmitMeta(
  extensions: FreeformExtension[],
  context: Omit<ExtensionSubmitContext, "meta"> & { meta?: SubmitMeta },
): Promise<SubmitMeta> {
  const meta: SubmitMeta = { ...(context.meta ?? {}) };

  const payloadContext: ExtensionPayloadContext = {
    ...context,
    meta,
    setMeta(next) {
      Object.assign(meta, next);
    },
    setCaptchaToken(name, value) {
      const existing = Array.isArray(meta.captchas) ? [...meta.captchas] : [];
      const index = existing.findIndex((entry) => entry.name === name);
      const token = { name, value };
      if (index >= 0) {
        existing[index] = token;
      } else {
        existing.push(token);
      }
      meta.captchas = existing;
      meta.captcha = token;
    },
  };

  for (const extension of extensions) {
    await extension.beforeSubmit?.({ ...context, meta });
    await extension.buildPayload?.(payloadContext);
  }

  return meta;
}

export async function runExtensionAfterSubmit(
  extensions: FreeformExtension[],
  context: ExtensionSubmitResultContext,
): Promise<void> {
  for (const extension of extensions) {
    await extension.afterSubmit?.(context);
  }
}
