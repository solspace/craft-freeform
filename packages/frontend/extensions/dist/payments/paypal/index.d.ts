import type { FreeformExtension } from "@solspace/freeform-core";
/**
 * PayPal Buttons bridge. Visitors approve payment in the PayPal UI first;
 * Freeform then captures via existing Craft routes and submits the order id
 * as the field value (same finalization path as classic forms).
 */
export declare function createPayPalPaymentExtension(): FreeformExtension;
export declare const paypalPaymentExtension: FreeformExtension;
//# sourceMappingURL=index.d.ts.map