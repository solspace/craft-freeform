import type { ManifestFieldDefinition } from "@solspace/freeform-core";
import type {
  FreeformReactTheme,
  FreeformRuntime,
  RendererOverrides,
} from "../types.js";

type FieldRendererProps = {
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  theme: FreeformReactTheme;
  renderers: RendererOverrides;
  allowRawHtml?: boolean;
};
export declare function FieldRenderer({
  field,
  form,
  theme,
  renderers,
  allowRawHtml,
}: FieldRendererProps): import("react").JSX.Element;
//# sourceMappingURL=FieldRenderer.d.ts.map
