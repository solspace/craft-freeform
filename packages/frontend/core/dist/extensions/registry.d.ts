import type { FreeformManifest, ManifestCaptchaSecurity, SubmitIntent } from "../types/manifest.js";
import type { SubmitContext, SubmitMeta, SubmitResponse } from "../types/submit.js";
export type ExtensionSeverity = "error" | "warning";
export type ExtensionDescriptor = {
    name: string;
    package: string;
    version: string;
    severity: ExtensionSeverity;
    fallback?: string | null;
};
export type RequiredExtensionDescriptor = Omit<ExtensionDescriptor, "severity"> & {
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
    context?: SubmitContext;
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
    /** Current form values — used by payment extensions for dynamic amounts */
    getValues?: () => Record<string, unknown>;
    /** Craft / Freeform origin used to resolve relative API URLs */
    baseUrl?: string;
};
export type FreeformExtension = {
    name: string;
    version?: string;
    initialize?: (context: ExtensionContext) => void | Promise<void>;
    setup?: (context: ExtensionSetupContext) => void | Promise<void>;
    destroy?: () => void | Promise<void>;
    supports?: (field: import("../types/manifest.js").ManifestFieldDefinition) => boolean;
    mount?: (context: FieldMountContext) => void | (() => void) | Promise<undefined | (() => void)>;
    mountCaptcha?: (context: CaptchaMountContext) => void | (() => void) | Promise<undefined | (() => void)>;
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
export declare function createExtensionRegistry(): ExtensionRegistry;
export declare function runExtensionSetups(extensions: FreeformExtension[], context: ExtensionSetupContext): Promise<void>;
export declare function collectExtensionSubmitMeta(extensions: FreeformExtension[], context: Omit<ExtensionSubmitContext, "meta"> & {
    meta?: SubmitMeta;
}): Promise<SubmitMeta>;
export declare function runExtensionAfterSubmit(extensions: FreeformExtension[], context: ExtensionSubmitResultContext): Promise<void>;
//# sourceMappingURL=registry.d.ts.map