import type { FreeformExtension } from "@solspace/freeform-core";
type FlatpickrInstance = {
    destroy: () => void;
    setDate: (date: string | Date, triggerChange?: boolean) => void;
};
type FlatpickrFn = (element: HTMLElement, options: Record<string, unknown>) => FlatpickrInstance;
declare global {
    interface Window {
        flatpickr?: FlatpickrFn;
    }
}
export declare function createDatetimeExtension(): FreeformExtension;
export declare const datetimeExtension: FreeformExtension;
export {};
//# sourceMappingURL=index.d.ts.map