export declare const TableFieldRenderer: import("vue").DefineComponent<{
    field: import("@solspace/freeform-core").ManifestFieldDefinition;
    form: import("../../types.js").FreeformRuntime;
    value: import("@solspace/freeform-core").FieldValue;
    errors: string[];
    input: Record<string, unknown>;
    classNames: import("../../types.js").FreeformThemeClassNames;
    allowRawHtml?: boolean | undefined;
    renderLabel: () => import("vue").VNode | null;
    renderInstructions: () => import("vue").VNode | null;
    renderErrors: () => import("vue").VNode | null;
}, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<{
    field: import("@solspace/freeform-core").ManifestFieldDefinition;
    form: import("../../types.js").FreeformRuntime;
    value: import("@solspace/freeform-core").FieldValue;
    errors: string[];
    input: Record<string, unknown>;
    classNames: import("../../types.js").FreeformThemeClassNames;
    allowRawHtml?: boolean | undefined;
    renderLabel: () => import("vue").VNode | null;
    renderInstructions: () => import("vue").VNode | null;
    renderErrors: () => import("vue").VNode | null;
}> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
