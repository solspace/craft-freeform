import type { ComponentType } from "react";
import type { FreeformButtonProps, FreeformButtonRowProps, FreeformComponentProps, FreeformErrorsProps, FreeformFieldWrapperProps, FreeformInstructionsProps, FreeformLabelProps, FreeformPageProps, FreeformRowProps, ReactFieldRendererProps } from "../../types.js";
import { UnsupportedFieldRenderer } from "./fields.js";
export declare function DefaultForm({ className, children, onSubmit, }: FreeformComponentProps): import("react").JSX.Element;
export declare function DefaultPage({ className, children }: FreeformPageProps): import("react").JSX.Element;
export declare function DefaultRow({ className, children }: FreeformRowProps): import("react").JSX.Element;
export declare function DefaultFieldWrapper({ field, form, className, children, }: FreeformFieldWrapperProps): import("react").JSX.Element | null;
export declare function DefaultLabel({ field, className, requiredIndicator, }: FreeformLabelProps): import("react").JSX.Element | null;
export declare function DefaultInstructions({ field, className, }: FreeformInstructionsProps): import("react").JSX.Element | null;
export declare function DefaultErrors({ errors, className, errorClassName, }: FreeformErrorsProps): import("react").JSX.Element | null;
export declare function DefaultButtonRow({ className, children, }: FreeformButtonRowProps): import("react").JSX.Element;
export declare function DefaultSubmitButton({ label, className, disabled, type, onClick, }: FreeformButtonProps): import("react").JSX.Element;
export declare function DefaultNextButton(props: FreeformButtonProps): import("react").JSX.Element;
export declare function DefaultBackButton(props: FreeformButtonProps): import("react").JSX.Element;
export declare function DefaultSaveButton(props: FreeformButtonProps): import("react").JSX.Element;
export declare function DefaultSuccessMessage({ message, className, }: {
    message: string;
    className?: string;
}): import("react").JSX.Element;
export declare const builtinRenderers: {
    frontend: Record<string, ComponentType<ReactFieldRendererProps>>;
    types: Record<string, ComponentType<ReactFieldRendererProps>>;
};
export declare const builtinComponents: {
    Form: typeof DefaultForm;
    Page: typeof DefaultPage;
    Row: typeof DefaultRow;
    FieldWrapper: typeof DefaultFieldWrapper;
    Label: typeof DefaultLabel;
    Instructions: typeof DefaultInstructions;
    Errors: typeof DefaultErrors;
    ButtonRow: typeof DefaultButtonRow;
    SubmitButton: typeof DefaultSubmitButton;
    NextButton: typeof DefaultNextButton;
    BackButton: typeof DefaultBackButton;
    SaveButton: typeof DefaultSaveButton;
    SuccessMessage: typeof DefaultSuccessMessage;
    UnsupportedField: typeof UnsupportedFieldRenderer;
};
//# sourceMappingURL=wrappers.d.ts.map