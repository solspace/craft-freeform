import {
  evaluateConditionals,
  isFieldEnabled,
  isFieldVisible,
  type VisibilityState,
} from "../conditionals/evaluator.js";
import type { FieldValue } from "../conditionals/operators.js";
import type { FreeformManifest } from "../types/manifest.js";
import type {
  SubmitContext,
  SubmitErrors,
  SubmitResponse,
} from "../types/submit.js";

export type FormStateOptions = {
  manifest: FreeformManifest;
  initialValues?: Record<string, FieldValue>;
  draftToken?: string | null;
  draftKey?: string | null;
};

export class FormState {
  readonly manifest: FreeformManifest;

  values: Record<string, FieldValue>;

  touched: Record<string, boolean> = {};

  dirty = false;

  currentPageIndex = 0;

  fieldErrors: Record<string, string[]> = {};

  formErrors: string[] = [];

  pageErrors: string[] = [];

  draftToken: string | null = null;

  draftKey: string | null = null;

  private visibility: VisibilityState;

  constructor(options: FormStateOptions) {
    this.manifest = options.manifest;
    this.values = buildInitialValues(options.manifest, options.initialValues);
    this.draftToken = options.draftToken ?? null;
    this.draftKey = options.draftKey ?? null;
    this.visibility = evaluateConditionals(this.manifest, this.values);
  }

  setValue(handle: string, value: FieldValue): void {
    this.values = { ...this.values, [handle]: value };
    this.touched = { ...this.touched, [handle]: true };
    this.dirty = true;
    this.recomputeVisibility();
  }

  getValue(handle: string): FieldValue {
    return this.values[handle];
  }

  setPageIndex(index: number): void {
    const max = Math.max(0, this.manifest.layout.pages.length - 1);
    this.currentPageIndex = Math.min(Math.max(0, index), max);
  }

  getSubmitContext(): SubmitContext {
    const context: SubmitContext = {};
    if (this.draftToken) {
      context.draftToken = this.draftToken;
    }
    if (this.draftKey) {
      context.draftKey = this.draftKey;
    }
    return context;
  }

  applySubmitResponse(response: SubmitResponse): void {
    const errors = response.errors ?? emptyErrors();
    this.fieldErrors = errors.fields ?? {};
    this.formErrors = errors.form ?? [];
    this.pageErrors = errors.page ?? [];

    if (response.page?.currentIndex !== undefined) {
      this.currentPageIndex = response.page.currentIndex;
    }

    if (response.draft?.token) {
      this.draftToken = response.draft.token;
    }
    if (response.draft?.key) {
      this.draftKey = response.draft.key;
    }

    const stateValues = response.state?.values;
    if (stateValues && typeof stateValues === "object") {
      for (const [handle, value] of Object.entries(stateValues)) {
        this.values[handle] = value as FieldValue;
      }
      this.recomputeVisibility();
    }

    if (response.state?.pageIndex !== undefined) {
      this.setPageIndex(response.state.pageIndex);
    }
  }

  isFieldVisible(handle: string): boolean {
    return isFieldVisible(this.visibility, handle);
  }

  isFieldEnabled(handle: string): boolean {
    return isFieldEnabled(this.visibility, handle);
  }

  getVisibleFieldHandles(): string[] {
    return Object.keys(this.manifest.fields).filter((handle) =>
      this.isFieldVisible(handle),
    );
  }

  getValuesForSubmit(): Record<string, unknown> {
    const output: Record<string, unknown> = {};

    for (const handle of this.getVisibleFieldHandles()) {
      if (!this.isFieldEnabled(handle)) {
        continue;
      }

      const value = this.values[handle];
      if (value !== undefined) {
        output[handle] = value;
      }
    }

    return output;
  }

  private recomputeVisibility(): void {
    this.visibility = evaluateConditionals(this.manifest, this.values);
  }
}

function buildInitialValues(
  manifest: FreeformManifest,
  overrides?: Record<string, FieldValue>,
): Record<string, FieldValue> {
  const values: Record<string, FieldValue> = {};

  for (const [handle, field] of Object.entries(manifest.fields)) {
    if (field.defaultValue !== undefined && field.defaultValue !== null) {
      values[handle] = field.defaultValue as FieldValue;
    } else if (field.options?.length) {
      const checked = field.options.filter((option) => option.checked);
      if (checked.length > 1) {
        values[handle] = checked.map((option) => option.value);
      } else if (checked.length === 1) {
        values[handle] = checked[0].value;
      }
    }
  }

  const contextDefaults = manifest.context?.defaultValues ?? {};
  for (const [handle, value] of Object.entries(contextDefaults)) {
    values[handle] = value as FieldValue;
  }

  return { ...values, ...overrides };
}

function emptyErrors(): SubmitErrors {
  return { fields: {}, form: [], page: [] };
}

export function createFormState(options: FormStateOptions): FormState {
  return new FormState(options);
}
