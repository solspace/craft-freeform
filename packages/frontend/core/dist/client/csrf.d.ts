export type CsrfToken = {
    name: string;
    value: string;
};
export type CsrfFetchOptions = {
    baseUrl: string;
    endpoint?: string;
    fetch?: typeof globalThis.fetch;
    credentials?: RequestCredentials;
};
export declare function fetchCsrfToken(options: CsrfFetchOptions): Promise<CsrfToken | null>;
//# sourceMappingURL=csrf.d.ts.map