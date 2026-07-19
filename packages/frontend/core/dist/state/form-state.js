import { evaluateConditionals, isFieldEnabled, isFieldVisible, } from "../conditionals/evaluator.js";
export class FormState {
    manifest;
    values;
    touched = {};
    dirty = false;
    currentPageIndex = 0;
    fieldErrors = {};
    formErrors = [];
    pageErrors = [];
    visibility;
    constructor(options) {
        this.manifest = options.manifest;
        this.values = buildInitialValues(options.manifest, options.initialValues);
        this.visibility = evaluateConditionals(this.manifest, this.values);
    }
    setValue(handle, value) {
        this.values = { ...this.values, [handle]: value };
        this.touched = { ...this.touched, [handle]: true };
        this.dirty = true;
        this.recomputeVisibility();
    }
    getValue(handle) {
        return this.values[handle];
    }
    setPageIndex(index) {
        const max = Math.max(0, this.manifest.layout.pages.length - 1);
        this.currentPageIndex = Math.min(Math.max(0, index), max);
    }
    applySubmitResponse(response) {
        const errors = response.errors ?? emptyErrors();
        this.fieldErrors = errors.fields ?? {};
        this.formErrors = errors.form ?? [];
        this.pageErrors = errors.page ?? [];
        if (response.page?.currentIndex !== undefined) {
            this.currentPageIndex = response.page.currentIndex;
        }
    }
    isFieldVisible(handle) {
        return isFieldVisible(this.visibility, handle);
    }
    isFieldEnabled(handle) {
        return isFieldEnabled(this.visibility, handle);
    }
    getVisibleFieldHandles() {
        return Object.keys(this.manifest.fields).filter((handle) => this.isFieldVisible(handle));
    }
    getValuesForSubmit() {
        const output = {};
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
    recomputeVisibility() {
        this.visibility = evaluateConditionals(this.manifest, this.values);
    }
}
function buildInitialValues(manifest, overrides) {
    const values = {};
    for (const [handle, field] of Object.entries(manifest.fields)) {
        if (field.defaultValue !== undefined && field.defaultValue !== null) {
            values[handle] = field.defaultValue;
        }
        else if (field.options?.length) {
            const checked = field.options.filter((option) => option.checked);
            if (checked.length > 1) {
                values[handle] = checked.map((option) => option.value);
            }
            else if (checked.length === 1) {
                values[handle] = checked[0].value;
            }
        }
    }
    const contextDefaults = manifest.context?.defaultValues ?? {};
    for (const [handle, value] of Object.entries(contextDefaults)) {
        values[handle] = value;
    }
    return { ...values, ...overrides };
}
function emptyErrors() {
    return { fields: {}, form: [], page: [] };
}
export function createFormState(options) {
    return new FormState(options);
}
