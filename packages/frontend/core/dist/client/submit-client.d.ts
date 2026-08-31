import type { FreeformManifest } from "../types/manifest.js";
import type { SubmitFileMap, SubmitRequest, SubmitResponse } from "../types/submit.js";
import { type CsrfToken } from "./csrf.js";
export type SubmitClientOptions = {
    baseUrl: string;
    clientVersion: string;
    fetch?: typeof globalThis.fetch;
    credentials?: RequestCredentials;
};
export type SubmitOptions = {
    manifest: FreeformManifest;
    request: SubmitRequest;
    files?: SubmitFileMap;
    csrf?: CsrfToken | null;
};
export declare function submitForm(options: SubmitClientOptions, params: SubmitOptions): Promise<SubmitResponse>;
//# sourceMappingURL=submit-client.d.ts.map