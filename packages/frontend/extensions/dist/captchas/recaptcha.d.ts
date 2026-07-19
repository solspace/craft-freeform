import type { FreeformExtension } from "@solspace/freeform-core";
type RecaptchaApi = {
    render: (element: HTMLElement, options: Record<string, unknown>) => number;
    reset: (widgetId?: number) => void;
    getResponse: (widgetId?: number) => string;
    execute: (siteKeyOrWidgetId?: string | number, options?: {
        action?: string;
    }) => Promise<string> | undefined;
    ready: (callback: () => void) => void;
};
declare global {
    interface Window {
        grecaptcha?: RecaptchaApi;
    }
}
export declare function createRecaptchaExtension(): FreeformExtension;
export declare const recaptchaExtension: FreeformExtension;
export {};
//# sourceMappingURL=recaptcha.d.ts.map