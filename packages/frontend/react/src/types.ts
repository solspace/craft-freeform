import type {
  FieldValue,
  FreeformExtension,
  FreeformManifest,
  ManifestCaptchaSecurity,
  ManifestFieldDefinition,
  SubmitIntent,
  SubmitResponse,
} from "@solspace/freeform-core";
import type { ComponentType, FormEvent, ReactNode } from "react";

export const PACKAGE_VERSION = "0.1.0-beta.1";
export const CLIENT_NAME = "@solspace/freeform-react";

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
  /** Static content (html / rich-text / image) — not input chrome */
  content?: string;
  errors?: string;
  error?: string;
  buttons?: string;
  button?: string;
  submitButton?: string;
  nextButton?: string;
  backButton?: string;
  success?: string;
};

export type ClassNameStrategy = "merge" | "replace";

export type ReactFieldRendererProps = {
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  value: FieldValue;
  errors: string[];
  input: Record<string, unknown>;
  classNames: FreeformThemeClassNames;
  allowRawHtml?: boolean;
  renderLabel: () => ReactNode;
  renderInstructions: () => ReactNode;
  renderErrors: () => ReactNode;
};

export type ReactFieldRenderer = ComponentType<ReactFieldRendererProps>;

export type RendererOverrides = {
  handles?: Record<string, ReactFieldRenderer>;
  frontend?: Record<string, ReactFieldRenderer>;
  types?: Record<string, ReactFieldRenderer>;
};

export type FreeformReactTheme = {
  name: string;
  framework: "react";
  classNameStrategy?: ClassNameStrategy;
  classNames?: FreeformThemeClassNames;
  renderers?: RendererOverrides & {
    components?: Partial<FreeformThemeComponents>;
  };
  defaults?: {
    renderLabels?: boolean;
    renderInstructions?: boolean;
    renderErrors?: boolean;
    requiredIndicator?: string;
    /** Light / dark palette. `system` follows prefers-color-scheme (default). */
    colorScheme?: "light" | "dark" | "system";
  };
};

export type FreeformThemeComponents = {
  Form: ComponentType<FreeformComponentProps>;
  Page: ComponentType<FreeformPageProps>;
  Row: ComponentType<FreeformRowProps>;
  FieldWrapper: ComponentType<FreeformFieldWrapperProps>;
  Label: ComponentType<FreeformLabelProps>;
  Instructions: ComponentType<FreeformInstructionsProps>;
  Errors: ComponentType<FreeformErrorsProps>;
  ButtonRow: ComponentType<FreeformButtonRowProps>;
  SubmitButton: ComponentType<FreeformButtonProps>;
  NextButton: ComponentType<FreeformButtonProps>;
  BackButton: ComponentType<FreeformButtonProps>;
  SuccessMessage: ComponentType<{ message: string; className?: string }>;
  UnsupportedField: ComponentType<ReactFieldRendererProps>;
};

export type FreeformComponentProps = {
  form: FreeformRuntime;
  className?: string;
  children: ReactNode;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export type FreeformPageProps = {
  form: FreeformRuntime;
  pageIndex: number;
  className?: string;
  children: ReactNode;
};

export type FreeformRowProps = {
  className?: string;
  children: ReactNode;
};

export type FreeformFieldWrapperProps = {
  field: ManifestFieldDefinition;
  form: FreeformRuntime;
  className?: string;
  children: ReactNode;
};

export type FreeformLabelProps = {
  field: ManifestFieldDefinition;
  className?: string;
  requiredIndicator?: string;
};

export type FreeformInstructionsProps = {
  field: ManifestFieldDefinition;
  className?: string;
};

export type FreeformErrorsProps = {
  errors: string[];
  className?: string;
  errorClassName?: string;
};

export type FreeformButtonRowProps = {
  className?: string;
  children: ReactNode;
};

export type FreeformButtonProps = {
  label: string;
  className?: string;
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
  reset: () => void;
  handleSubmit: (event?: FormEvent) => Promise<void>;
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
  clientVersion?: string;
  fetch?: typeof globalThis.fetch;
  credentials?: RequestCredentials;
  theme?: FreeformReactTheme;
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
  theme: FreeformReactTheme;
  renderers: RendererOverrides;
  allowRawHtml: boolean;
} & Omit<FreeformRuntime, "manifest">;

export type FreeformProps = UseFreeformOptions & {
  children?: (form: UseFreeformResult) => ReactNode;
  className?: string;
  loadingMessage?: string;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
};
