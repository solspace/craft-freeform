import type { FreeformManifest } from "../types/manifest.js";
import { type FieldValue } from "./operators.js";
export type VisibilityState = {
    visible: Set<string>;
    hidden: Set<string>;
    enabled: Set<string>;
    disabled: Set<string>;
};
export declare function evaluateConditionals(manifest: FreeformManifest, values: Record<string, FieldValue>): VisibilityState;
export declare function isFieldVisible(state: VisibilityState, handle: string): boolean;
export declare function isFieldEnabled(state: VisibilityState, handle: string): boolean;
//# sourceMappingURL=evaluator.d.ts.map