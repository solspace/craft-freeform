import { type PropType } from "vue";
import type { FreeformComponentProps, FreeformFieldWrapperProps, FreeformInstructionsProps, FreeformLabelProps, FreeformPageProps, VueFieldRenderer, VueFieldRendererProps } from "../../types.js";
import { UnsupportedFieldRenderer } from "./fields.js";
export declare const DefaultForm: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    form: {
        type: PropType<FreeformComponentProps["form"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    onSubmit: {
        type: PropType<FreeformComponentProps["onSubmit"]>;
        required: true;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    form: {
        type: PropType<FreeformComponentProps["form"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    onSubmit: {
        type: PropType<FreeformComponentProps["onSubmit"]>;
        required: true;
    };
}>> & Readonly<{}>, {
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultPage: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    form: {
        type: PropType<FreeformPageProps["form"]>;
        required: true;
    };
    pageIndex: {
        type: NumberConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    form: {
        type: PropType<FreeformPageProps["form"]>;
        required: true;
    };
    pageIndex: {
        type: NumberConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultRow: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultFieldWrapper: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    field: {
        type: PropType<FreeformFieldWrapperProps["field"]>;
        required: true;
    };
    form: {
        type: PropType<FreeformFieldWrapperProps["form"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    field: {
        type: PropType<FreeformFieldWrapperProps["field"]>;
        required: true;
    };
    form: {
        type: PropType<FreeformFieldWrapperProps["form"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultLabel: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    field: {
        type: PropType<FreeformLabelProps["field"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    requiredIndicator: {
        type: StringConstructor;
        default: string;
    };
}>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    field: {
        type: PropType<FreeformLabelProps["field"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    requiredIndicator: {
        type: StringConstructor;
        default: string;
    };
}>> & Readonly<{}>, {
    requiredIndicator: string;
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultInstructions: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    field: {
        type: PropType<FreeformInstructionsProps["field"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    field: {
        type: PropType<FreeformInstructionsProps["field"]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultErrors: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    errors: {
        type: PropType<string[]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    errorClass: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    errors: {
        type: PropType<string[]>;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    errorClass: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    class: string;
    errorClass: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultButtonRow: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultSubmitButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    type: "button" | "submit";
    disabled: boolean;
    onClick: () => void;
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultNextButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    type: "button" | "submit";
    disabled: boolean;
    onClick: () => void;
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultBackButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    type: "button" | "submit";
    disabled: boolean;
    onClick: () => void;
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultSaveButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    label: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    type: {
        type: PropType<"button" | "submit">;
        default: "button" | "submit";
    };
    onClick: {
        type: PropType<() => void>;
        default: undefined;
    };
}>> & Readonly<{}>, {
    type: "button" | "submit";
    disabled: boolean;
    onClick: () => void;
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const DefaultSuccessMessage: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
    message: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
    message: {
        type: StringConstructor;
        required: true;
    };
    class: {
        type: StringConstructor;
        default: undefined;
    };
}>> & Readonly<{}>, {
    class: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
export declare const builtinRenderers: {
    frontend: Record<string, VueFieldRenderer>;
    types: Record<string, VueFieldRenderer>;
};
export declare const builtinComponents: {
    Form: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        form: {
            type: PropType<FreeformComponentProps["form"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        onSubmit: {
            type: PropType<FreeformComponentProps["onSubmit"]>;
            required: true;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        form: {
            type: PropType<FreeformComponentProps["form"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        onSubmit: {
            type: PropType<FreeformComponentProps["onSubmit"]>;
            required: true;
        };
    }>> & Readonly<{}>, {
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    Page: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        form: {
            type: PropType<FreeformPageProps["form"]>;
            required: true;
        };
        pageIndex: {
            type: NumberConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        form: {
            type: PropType<FreeformPageProps["form"]>;
            required: true;
        };
        pageIndex: {
            type: NumberConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    Row: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    FieldWrapper: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        field: {
            type: PropType<FreeformFieldWrapperProps["field"]>;
            required: true;
        };
        form: {
            type: PropType<FreeformFieldWrapperProps["form"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        field: {
            type: PropType<FreeformFieldWrapperProps["field"]>;
            required: true;
        };
        form: {
            type: PropType<FreeformFieldWrapperProps["form"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    Label: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        field: {
            type: PropType<FreeformLabelProps["field"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        requiredIndicator: {
            type: StringConstructor;
            default: string;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        field: {
            type: PropType<FreeformLabelProps["field"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        requiredIndicator: {
            type: StringConstructor;
            default: string;
        };
    }>> & Readonly<{}>, {
        requiredIndicator: string;
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    Instructions: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        field: {
            type: PropType<FreeformInstructionsProps["field"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        field: {
            type: PropType<FreeformInstructionsProps["field"]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    Errors: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        errors: {
            type: PropType<string[]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        errorClass: {
            type: StringConstructor;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element | null, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        errors: {
            type: PropType<string[]>;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        errorClass: {
            type: StringConstructor;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        class: string;
        errorClass: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    ButtonRow: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    SubmitButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        type: "button" | "submit";
        disabled: boolean;
        onClick: () => void;
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    NextButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        type: "button" | "submit";
        disabled: boolean;
        onClick: () => void;
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    BackButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        type: "button" | "submit";
        disabled: boolean;
        onClick: () => void;
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    SaveButton: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        label: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
        disabled: {
            type: BooleanConstructor;
            default: boolean;
        };
        type: {
            type: PropType<"button" | "submit">;
            default: "button" | "submit";
        };
        onClick: {
            type: PropType<() => void>;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        type: "button" | "submit";
        disabled: boolean;
        onClick: () => void;
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    SuccessMessage: import("vue").DefineComponent<import("vue").ExtractPropTypes<{
        message: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>, () => import("vue/jsx-runtime").JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<import("vue").ExtractPropTypes<{
        message: {
            type: StringConstructor;
            required: true;
        };
        class: {
            type: StringConstructor;
            default: undefined;
        };
    }>> & Readonly<{}>, {
        class: string;
    }, {}, {}, {}, string, import("vue").ComponentProvideOptions, true, {}, any>;
    UnsupportedField: typeof UnsupportedFieldRenderer;
};
export type { VueFieldRendererProps };
