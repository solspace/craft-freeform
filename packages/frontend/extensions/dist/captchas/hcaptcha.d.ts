import type { FreeformExtension } from "@solspace/freeform-core";
type HcaptchaApi = {
    render: (element: HTMLElement, options: Record<string, unknown>) => string | number;
    reset: (widgetId?: string | number) => void;
    getResponse: (widgetId?: string | number) => string;
    execute: (widgetId?: string | number) => void;
};
declare global {
    interface Window {
        hcaptcha?: HcaptchaApi;
    }
}
export declare function createHcaptchaExtension(): FreeformExtension;
export declare const hcaptchaExtension: FreeformExtension;
export {};
//# sourceMappingURL=hcaptcha.d.ts.map