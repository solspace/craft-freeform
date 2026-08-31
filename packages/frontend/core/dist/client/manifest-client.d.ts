import type { FreeformManifest } from "../types/manifest.js";
export type ManifestClientOptions = {
    baseUrl: string;
    clientVersion: string;
    fetch?: typeof globalThis.fetch;
    credentials?: RequestCredentials;
};
export type FetchManifestOptions = {
    handle?: string;
    profile?: string;
    properties?: Record<string, string | number | boolean>;
};
export declare class ManifestCompatibilityError extends Error {
    constructor(message: string);
}
export declare function fetchManifest(options: ManifestClientOptions, params: FetchManifestOptions): Promise<FreeformManifest>;
//# sourceMappingURL=manifest-client.d.ts.map