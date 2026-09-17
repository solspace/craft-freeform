import type {
  FieldValue,
  FreeformExtension,
  FreeformManifest,
  ManifestCaptchaSecurity,
  ManifestFieldDefinition,
  SubmitIntent,
  SubmitResponse,
} from "@solspace/freeform-core";
import type { Component, VNode } from "vue";

export { PACKAGE_VERSION } from "./version.js";
export const CLIENT_NAME = "@solspace/freeform-vue";

export type FreeformThemeClassNames = {
  form?: string;
  page?: string;
  row?: string;
  field?: string;
  fieldRequired?: string;
  fieldHidden?: string;
  fieldHasErrors?: string;
  label?: string;
  instructions?: string;
  input?: string;
  inputError?: string;
  optionLabel?: string;
  optionInput?: string;
  content?: string;
  errors?: string;
  error?: string;
  buttons?: string;
  button?: string;
  submitButton?: string;
  nextButton?: string;
  backButton?: string;
  saveButton?: string;
  success?: string;
};

export type ClassNameStrategy = "merge" | "replace";

export type VueFieldRendererProps = {
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  value: FieldValue;
  errors: string[];
  input: Record<string, unknown>;
  classNames: FreeformThemeClassNames;
  allowRawHtml?: boolean;
  renderLabel: () => VNode | null;
  renderInstructions: () => VNode | null;
  renderErrors: () => VNode | null;
};

export type VueFieldRenderer = Component<VueFieldRendererProps>;

export type RendererOverrides = {
  handles?: Record<string, VueFieldRenderer>;
  frontend?: Record<string, VueFieldRenderer>;
  types?: Record<string, VueFieldRenderer>;
};

export type FreeformVueTheme = {
  name: string;
  framework: "vue";
  classNameStrategy?: ClassNameStrategy;
  classNames?: FreeformThemeClassNames;
  classNamesByType?: Record<string, Partial<FreeformThemeClassNames>>;
  renderers?: RendererOverrides & {
    components?: Partial<FreeformThemeComponents>;
  };
  defaults?: {
    renderLabels?: boolean;
    renderInstructions?: boolean;
    renderErrors?: boolean;
    requiredIndicator?: string;
    colorScheme?: "light" | "dark" | "system";
  };
};

export type FreeformThemeComponents = {
  Form: Component<FreeformComponentProps>;
  Page: Component<FreeformPageProps>;
  Row: Component<FreeformRowProps>;
  FieldWrapper: Component<FreeformFieldWrapperProps>;
  Label: Component<FreeformLabelProps>;
  Instructions: Component<FreeformInstructionsProps>;
  Errors: Component<FreeformErrorsProps>;
  ButtonRow: Component<FreeformButtonRowProps>;
  SubmitButton: Component<FreeformButtonProps>;
  NextButton: Component<FreeformButtonProps>;
  BackButton: Component<FreeformButtonProps>;
  SaveButton: Component<FreeformButtonProps>;
  SuccessMessage: Component<{ message: string; class?: string }>;
  UnsupportedField: Component<VueFieldRendererProps>;
};

export type FreeformComponentProps = {
  form: FreeformRuntime;
  class?: string;
  onSubmit: (event: Event) => void;
};

export type FreeformPageProps = {
  form: FreeformRuntime;
  pageIndex: number;
  class?: string;
};

export type FreeformRowProps = {
  class?: string;
};

export type FreeformFieldWrapperProps = {
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  class?: string;
};

export type FreeformLabelProps = {
  field: ManifestFieldDefinition;
  class?: string;
  requiredIndicator?: string;
};

export type FreeformInstructionsProps = {
  field: ManifestFieldDefinition;
  class?: string;
};

export type FreeformErrorsProps = {
  errors: string[];
  class?: string;
  errorClass?: string;
};

export type FreeformButtonRowProps = {
  class?: string;
};

export type FreeformButtonProps = {
  label: string;
  class?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
};

export type FreeformRuntime = {
  manifest: FreeformManifest;
  values: Record<string, FieldValue>;
  touched: Record<string, boolean>;
  fieldErrors: Record<string, string[]>;
  formErrors: string[];
  pageErrors: string[];
  currentPageIndex: number;
  isSubmitting: boolean;
  isComplete: boolean;
  successMessage: string | null;
  setValue: (handle: string, value: FieldValue) => void;
  getValue: (handle: string) => FieldValue;
  isFieldVisible: (handle: string) => boolean;
  isFieldEnabled: (handle: string) => boolean;
  getFieldProps: (handle: string) => Record<string, unknown>;
  submit: (intent?: SubmitIntent) => Promise<SubmitResponse | undefined>;
  validate: () => Promise<SubmitResponse | undefined>;
  goNext: () => Promise<SubmitResponse | undefined>;
  goBack: () => Promise<SubmitResponse | undefined>;
  saveDraft: () => Promise<SubmitResponse | undefined>;
  reset: () => void;
  handleSubmit: (event?: Event) => Promise<void>;
  mountFieldExtension: (handle: string, element: HTMLElement) => () => void;
  mountCaptcha: (
    captcha: ManifestCaptchaSecurity,
    element: HTMLElement,
  ) => () => void;
};

export type UseFreeformOptions = {
  handle?: string;
  profile?: string;
  properties?: Record<string, string | number | boolean>;
  baseUrl: string;
  manifest?: FreeformManifest;
  initialValues?: Record<string, FieldValue>;
  draftToken?: string | null;
  draftKey?: string | null;
  clientVersion?: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
  theme?: FreeformVueTheme;
  renderers?: RendererOverrides;
  extensions?: FreeformExtension[];
  allowRawHtml?: boolean;
  onSuccess?: (response: SubmitResponse) => void;
  onError?: (response: SubmitResponse) => void;
  onManifestLoaded?: (manifest: FreeformManifest) => void;
};

export type UseFreeformResult = {
  loading: boolean;
  error: Error | null;
  manifest: FreeformManifest | null;
  theme: FreeformVueTheme;
  renderers: RendererOverrides;
  allowRawHtml: boolean;
} & Omit<FreeformRuntime, "manifest">;

export type FreeformProps = UseFreeformOptions & {
  class?: string;
  loadingMessage?: string;
};
