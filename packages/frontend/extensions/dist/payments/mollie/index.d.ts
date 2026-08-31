import type { FreeformExtension } from "@solspace/freeform-core";
/**
 * Mollie hosted-checkout bridge. On final submit Freeform creates a Mollie
 * payment server-side, stores the payment id on the field, then redirects the
 * browser to Mollie — the same flow as classic Freeform templates.
 */
export declare function createMolliePaymentExtension(): FreeformExtension;
export declare class MolliePaymentRedirectError extends Error {
    readonly url: string;
    constructor(url: string);
}
export declare const molliePaymentExtension: FreeformExtension;
//# sourceMappingURL=index.d.ts.map