import type { FreeformExtension } from "@solspace/freeform-core";
type SquareCard = {
    attach: (element: HTMLElement) => Promise<void>;
    destroy?: () => Promise<void>;
    tokenize: () => Promise<{
        status?: string;
        token?: string;
        errors?: Array<{
            message?: string;
        }>;
    }>;
};
declare global {
    interface Window {
        Square?: {
            payments: (applicationId: string, locationId: string) => {
                card: () => Promise<SquareCard>;
            };
        };
    }
}
/**
 * Square Web Payments SDK bridge. Tokenization happens in the browser; the
 * nonce, current form values, and amount calculation are sent to Craft, where
 * Freeform creates the charge with its server-side Square access token.
 */
export declare function createSquarePaymentExtension(): FreeformExtension;
export declare const squarePaymentExtension: FreeformExtension;
export {};
//# sourceMappingURL=index.d.ts.map