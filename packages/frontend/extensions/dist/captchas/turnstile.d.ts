import type { FreeformExtension } from "@solspace/freeform-core";
type TurnstileApi = {
    render: (element: HTMLElement, options: Record<string, unknown>) => string | number;
    reset: (widgetId?: string | number) => void;
    getResponse?: (widgetId?: string | number) => string;
};
declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}
export declare function createTurnstileExtension(): FreeformExtension;
export declare const turnstileExtension: FreeformExtension;
export {};
//# sourceMappingURL=turnstile.d.ts.map