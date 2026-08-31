/** Text-like controls — Tailwind 4 utilities, scanned as full string literals. */
export const lightTextInput = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6";
export const darkTextInput = "block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6";
export const lightSelectInput = "col-start-1 row-start-1 block w-full appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6";
export const darkSelectInput = "col-start-1 row-start-1 block w-full appearance-none rounded-md bg-white/5 py-1.5 pr-8 pl-3 text-base text-white outline outline-1 -outline-offset-1 outline-white/10 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6";
export const lightFileInput = "block w-full text-sm text-gray-900 file:mr-4 file:inline-flex file:cursor-pointer file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-gray-900 file:outline file:outline-1 file:outline-gray-300 hover:file:bg-gray-50";
export const darkFileInput = "block w-full text-sm text-white file:mr-4 file:inline-flex file:cursor-pointer file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white file:outline file:outline-1 file:outline-white/10 hover:file:bg-white/20";
export const lightFileDndInput = "flex min-h-32 w-full items-center justify-center rounded-md border border-dashed border-gray-900/25 bg-white px-6 py-10 text-sm text-gray-600";
export const darkFileDndInput = "flex min-h-32 w-full items-center justify-center rounded-md border border-dashed border-white/20 bg-white/5 px-6 py-10 text-sm text-gray-300";
export const lightOptionLabel = "flex items-center gap-x-2 text-sm/6 font-medium text-gray-900";
export const darkOptionLabel = "flex items-center gap-x-2 text-sm/6 font-medium text-white";
export const lightCheckboxInput = "size-4 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
export const darkCheckboxInput = "size-4 appearance-none rounded-sm border border-white/20 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 indeterminate:border-indigo-500 indeterminate:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
export const lightRadioInput = "size-4 appearance-none rounded-full border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600";
export const darkRadioInput = "size-4 appearance-none rounded-full border border-white/20 bg-white/5 checked:border-indigo-500 checked:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500";
export const lightChoiceGroup = "flex flex-col gap-2";
export const darkChoiceGroup = "flex flex-col gap-2";
export const lightPaymentHost = "block min-h-10 w-full";
export const darkPaymentHost = "block min-h-10 w-full";
export const lightClassNames = {
    form: "w-full",
    page: "w-full",
    row: "mb-4 flex flex-wrap gap-x-4",
    field: "mb-1 min-w-0 flex-1 basis-0",
    fieldHidden: "hidden",
    label: "mb-1 block text-sm/6 font-medium text-gray-900",
    instructions: "-mt-0.5 mb-1 text-sm text-gray-500",
    input: lightTextInput,
    inputError: "outline-red-600 focus:outline-red-600",
    optionLabel: lightOptionLabel,
    optionInput: lightCheckboxInput,
    content: "text-sm text-gray-700",
    errors: "mt-1",
    error: "text-sm text-red-600",
    buttons: "mt-2 flex flex-wrap items-center gap-3",
    button: "rounded-md px-5 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    submitButton: "rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50",
    nextButton: "rounded-md bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50",
    backButton: "rounded-md bg-white px-5 py-2 text-sm font-semibold text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
    saveButton: "rounded-md bg-white px-5 py-2 text-sm font-semibold text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50",
    success: "rounded-md bg-green-50 p-4 text-sm font-medium text-green-800",
};
export const darkClassNames = {
    form: "w-full",
    page: "w-full",
    row: "mb-4 flex flex-wrap gap-x-4",
    field: "mb-1 min-w-0 flex-1 basis-0",
    fieldHidden: "hidden",
    label: "mb-1 block text-sm/6 font-medium text-white",
    instructions: "-mt-0.5 mb-1 text-sm text-gray-400",
    input: darkTextInput,
    inputError: "outline-red-500 focus:outline-red-500",
    optionLabel: darkOptionLabel,
    optionInput: darkCheckboxInput,
    content: "text-sm text-gray-300",
    errors: "mt-1",
    error: "text-sm text-red-400",
    buttons: "mt-2 flex flex-wrap items-center gap-3",
    button: "rounded-md px-5 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    submitButton: "rounded-md bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
    nextButton: "rounded-md bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50",
    backButton: "rounded-md bg-white/10 px-5 py-2 text-sm font-semibold text-white outline outline-1 -outline-offset-1 outline-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50",
    saveButton: "rounded-md bg-white/10 px-5 py-2 text-sm font-semibold text-white outline outline-1 -outline-offset-1 outline-white/10 hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50",
    success: "rounded-md bg-green-950 p-4 text-sm font-medium text-green-300",
};
const textTypes = [
    "text",
    "textarea",
    "email",
    "number",
    "phone",
    "website",
    "password",
    "regex",
    "datetime",
    "confirm",
    "calculation",
];
function textTypeMap(input) {
    return Object.fromEntries(textTypes.map((type) => [type, { input }]));
}
export function lightClassNamesByType() {
    return {
        ...textTypeMap(lightTextInput),
        dropdown: { input: lightSelectInput },
        select: { input: lightSelectInput },
        "multiple-select": {
            input: `${lightSelectInput} min-h-32`,
        },
        checkbox: {
            input: lightOptionLabel,
            optionLabel: lightOptionLabel,
            optionInput: lightCheckboxInput,
        },
        checkboxes: {
            input: lightChoiceGroup,
            optionLabel: lightOptionLabel,
            optionInput: lightCheckboxInput,
        },
        radios: {
            input: lightChoiceGroup,
            optionLabel: lightOptionLabel,
            optionInput: lightRadioInput,
        },
        radio: {
            input: lightChoiceGroup,
            optionLabel: lightOptionLabel,
            optionInput: lightRadioInput,
        },
        radiobox: {
            input: lightChoiceGroup,
            optionLabel: lightOptionLabel,
            optionInput: lightRadioInput,
        },
        file: { input: lightFileInput },
        "file-upload": { input: lightFileInput },
        "file-dnd": { input: lightFileDndInput },
        stripe: { input: lightPaymentHost },
        "payment.stripe": { input: lightPaymentHost },
        square: { input: lightPaymentHost },
        "payment.square": { input: lightPaymentHost },
        paypal: { input: lightPaymentHost },
        "payment.paypal": { input: lightPaymentHost },
        html: { content: "text-sm text-gray-700" },
        "rich-text": { content: "text-sm text-gray-700" },
        image: { content: "block max-w-full" },
        group: { input: "w-full" },
        signature: {
            input: "overflow-hidden rounded-md bg-white outline outline-1 -outline-offset-1 outline-gray-300",
        },
        table: { input: "w-full overflow-x-auto text-sm text-gray-900" },
        "opinion-scale": {
            input: "flex flex-wrap gap-2",
            optionLabel: "relative flex cursor-pointer items-center justify-center rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-100 has-checked:outline-2 has-checked:outline-indigo-600",
            optionInput: "sr-only",
        },
        rating: {
            input: "flex flex-wrap gap-1",
            optionLabel: "cursor-pointer text-2xl",
            optionInput: "sr-only",
        },
        cards: {
            input: "grid gap-3 sm:grid-cols-2",
            optionLabel: "relative flex h-full cursor-pointer flex-col rounded-md bg-gray-50 pb-3 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 hover:bg-gray-100 has-checked:outline-2 has-checked:outline-indigo-500",
            optionInput: "sr-only",
        },
    };
}
export function darkClassNamesByType() {
    return {
        ...textTypeMap(darkTextInput),
        dropdown: { input: darkSelectInput },
        select: { input: darkSelectInput },
        "multiple-select": {
            input: `${darkSelectInput} min-h-32`,
        },
        checkbox: {
            input: darkOptionLabel,
            optionLabel: darkOptionLabel,
            optionInput: darkCheckboxInput,
        },
        checkboxes: {
            input: darkChoiceGroup,
            optionLabel: darkOptionLabel,
            optionInput: darkCheckboxInput,
        },
        radios: {
            input: darkChoiceGroup,
            optionLabel: darkOptionLabel,
            optionInput: darkRadioInput,
        },
        radio: {
            input: darkChoiceGroup,
            optionLabel: darkOptionLabel,
            optionInput: darkRadioInput,
        },
        radiobox: {
            input: darkChoiceGroup,
            optionLabel: darkOptionLabel,
            optionInput: darkRadioInput,
        },
        file: { input: darkFileInput },
        "file-upload": { input: darkFileInput },
        "file-dnd": { input: darkFileDndInput },
        stripe: { input: darkPaymentHost },
        "payment.stripe": { input: darkPaymentHost },
        square: { input: darkPaymentHost },
        "payment.square": { input: darkPaymentHost },
        paypal: { input: darkPaymentHost },
        "payment.paypal": { input: darkPaymentHost },
        html: { content: "text-sm text-gray-300" },
        "rich-text": { content: "text-sm text-gray-300" },
        image: { content: "block max-w-full" },
        group: { input: "w-full" },
        signature: {
            input: "overflow-hidden rounded-md bg-white/5 outline outline-1 -outline-offset-1 outline-white/10",
        },
        table: { input: "w-full overflow-x-auto text-sm text-white" },
        "opinion-scale": {
            input: "flex flex-wrap gap-2",
            optionLabel: "relative flex cursor-pointer items-center justify-center rounded-md bg-white/5 px-3 py-1.5 text-sm text-white outline outline-1 -outline-offset-1 outline-white/10 hover:bg-white/10 has-checked:outline-2 has-checked:outline-indigo-500",
            optionInput: "sr-only",
        },
        rating: {
            input: "flex flex-wrap gap-1",
            optionLabel: "cursor-pointer text-2xl",
            optionInput: "sr-only",
        },
        cards: {
            input: "grid gap-3 sm:grid-cols-2",
            optionLabel: "relative flex h-full cursor-pointer flex-col rounded-md bg-white/5 pb-3 text-sm text-white outline outline-1 -outline-offset-1 outline-white/10 hover:bg-white/10 has-checked:outline-2 has-checked:outline-indigo-500",
            optionInput: "sr-only",
        },
    };
}
