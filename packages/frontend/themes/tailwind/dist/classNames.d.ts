import type { FreeformThemeClassNames } from "@solspace/freeform-react";
/** Text-like controls — Tailwind 4 utilities, scanned as full string literals. */
export declare const lightTextInput = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6";
export declare const darkTextInput = "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6";
export declare const lightSelectInput = "col-start-1 row-start-1 block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6";
export declare const darkSelectInput = "col-start-1 row-start-1 block w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6";
export declare const lightFileInput = "block w-full text-sm text-gray-900 file:mr-4 file:inline-flex file:cursor-pointer file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-gray-900 file:outline file:outline-1 file:outline-gray-300 hover:file:bg-gray-50";
export declare const darkFileInput = "block w-full text-sm text-white file:mr-4 file:inline-flex file:cursor-pointer file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white file:outline file:outline-1 file:outline-white/10 hover:file:bg-white/20";
export declare const lightFileDndInput = "flex min-h-32 w-full items-center justify-center rounded-md border border-dashed border-gray-900/25 bg-white px-6 py-10 text-sm text-gray-600";
export declare const darkFileDndInput = "flex min-h-32 w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-white/5 px-6 py-10 text-sm text-gray-300";
export declare const lightOptionLabel = "flex items-center gap-x-2 text-sm/6 font-medium text-gray-900";
export declare const darkOptionLabel = "flex items-center gap-x-2 text-sm/6 font-medium text-white";
export declare const lightCheckboxInput = "size-4 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
export declare const darkCheckboxInput = "size-4 appearance-none rounded-sm border border-white/20 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 indeterminate:border-indigo-500 indeterminate:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
export declare const lightRadioInput = "size-4 appearance-none rounded-full border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
export declare const darkRadioInput = "size-4 appearance-none rounded-full border border-white/20 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
export declare const lightChoiceGroup = "flex flex-col gap-2";
export declare const darkChoiceGroup = "flex flex-col gap-2";
export declare const lightPaymentHost = "block min-h-10 w-full";
export declare const darkPaymentHost = "block min-h-10 w-full";
export declare const lightClassNames: FreeformThemeClassNames;
export declare const darkClassNames: FreeformThemeClassNames;
export declare function lightClassNamesByType(): Record<string, Partial<FreeformThemeClassNames>>;
export declare function darkClassNamesByType(): Record<string, Partial<FreeformThemeClassNames>>;
//# sourceMappingURL=classNames.d.ts.map