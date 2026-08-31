import type { FieldValue } from "../conditionals/operators.js";
import type { FreeformManifest } from "../types/manifest.js";
import type { SubmitContext, SubmitResponse } from "../types/submit.js";
export type FormStateOptions = {
    manifest: FreeformManifest;
    initialValues?: Record<string, FieldValue>;
    draftToken?: string | null;
    draftKey?: string | null;
};
export declare class FormState {
    readonly manifest: FreeformManifest;
    values: Record<string, FieldValue>;
    touched: Record<string, boolean>;
    dirty: boolean;
    currentPageIndex: number;
    fieldErrors: Record<string, string[]>;
    formErrors: string[];
    pageErrors: string[];
    draftToken: string | null;
    draftKey: string | null;
    stateToken: string | null;
    private visibility;
    constructor(options: FormStateOptions);
    setValue(handle: string, value: FieldValue): void;
    getValue(handle: string): FieldValue;
    setPageIndex(index: number): void;
    getSubmitContext(): SubmitContext;
    applySubmitResponse(response: SubmitResponse): void;
    isFieldVisible(handle: string): boolean;
    isFieldEnabled(handle: string): boolean;
    getVisibleFieldHandles(): string[];
    getValuesForSubmit(): Record<string, unknown>;
    private recomputeVisibility;
}
export declare function createFormState(options: FormStateOptions): FormState;
//# sourceMappingURL=form-state.d.ts.map