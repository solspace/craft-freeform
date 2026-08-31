import type { FreeformExtension } from "@solspace/freeform-core";
/**
 * Stripe Payment Element bridge.
 *
 * Covers:
 * - successful cards (confirm + classic callback finalization)
 * - 3DS / redirect cards (return_url → Stripe callback)
 * - failed cards (Stripe error messages thrown into form submit)
 * - dynamic amounts (server amount update before confirm)
 * - multipage (payment only runs on final submit intent)
 */
export declare function createStripePaymentExtension(): FreeformExtension;
export declare class StripePaymentRedirectError extends Error {
    readonly url: string;
    constructor(url: string);
}
export declare const stripePaymentExtension: FreeformExtension;
//# sourceMappingURL=index.d.ts.map