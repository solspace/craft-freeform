import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import type { FreeformRuntime, FreeformVueTheme, RendererOverrides } from "../types.js";
type __VLS_Props = {
    field: ManifestFieldDefinition;
    form: FreeformRuntime;
    theme: FreeformVueTheme;
    renderers: RendererOverrides;
    allowRawHtml?: boolean;
};
declare const __VLS_export: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: typeof __VLS_export;
export default _default;
