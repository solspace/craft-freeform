export type CaptchaToken = {
    name: string;
    value: string;
};
export type LoadedScriptHandle = {
    promise: Promise<void>;
};
export declare function loadScriptOnce(src: string, id: string): Promise<void>;
export declare function waitForValue(read: () => string | null | undefined, timeoutMs?: number, intervalMs?: number): Promise<string>;
export declare function inferCaptchaProvider(captcha: {
    provider?: string;
    name?: string;
}): string | null;
//# sourceMappingURL=shared.d.ts.map