export type ManifestSchemaVersion = "1.0";

export type SubmitIntent =
  | "submit"
  | "next"
  | "back"
  | "validate"
  | "saveDraft";

export type ManifestSecurityIntegration = {
  name: string;
  errorMessage?: string;
  value?: string;
};

export type ManifestCaptchaProvider =
  | "turnstile"
  | "recaptcha"
  | "hcaptcha"
  | "friendly-captcha"
  | string;

export type ManifestCaptchaSecurity = ManifestSecurityIntegration & {
  provider?: ManifestCaptchaProvider;
  siteKey?: string | null;
  size?: string;
  theme?: string;
  locale?: string;
  failureBehavior?: string;
  triggerOnInteract?: boolean;
  version?: string | null;
  action?: string | null;
  scoreThreshold?: string | number | null;
  startMode?: string;
  apiEndpoint?: string;
};

export type ManifestSecurity = {
  csrf?: {
    required: boolean;
    tokenEndpoint: string;
    submitAs: {
      json: "header";
      multipart: "field";
    };
  };
  honeypot?: ManifestSecurityIntegration;
  javascriptTest?: ManifestSecurityIntegration;
  captchas?: ManifestCaptchaSecurity[];
};

export type ManifestFieldDefinition = {
  id: number;
  uid: string;
  handle: string;
  type: string;
  label: string;
  instructions?: string | null;
  required: boolean;
  defaultValue?: unknown;
  placeholder?: string | null;
  options?: Array<{ label: string; value: string; checked?: boolean }>;
  frontend?: {
    renderer?: string;
    extension?: string | null;
    config?: Record<string, unknown>;
  };
  validation?: Record<string, unknown>;
  content?: {
    rendered?: { html?: string };
    structured?: unknown;
    image?: {
      src?: string | null;
      srcset?: string | null;
      alt?: string | null;
    };
  };
  layout?: { rows?: Array<{ uid: string; fields: string[] }> };
};

export type ConditionalOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "greaterThanOrEquals"
  | "lessThan"
  | "lessThanOrEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "isEmpty"
  | "isNotEmpty"
  | "isOneOf"
  | "isNotOneOf";

export type ConditionalRule = {
  target: string;
  action: string;
  logic: "all" | "any";
  conditions: Array<{
    field: string;
    operator: ConditionalOperator | string;
    value?: string;
  }>;
};

export type ManifestConditionals = {
  fields: ConditionalRule[];
  pages: ConditionalRule[];
  buttons: ConditionalRule[];
  submit: ConditionalRule[];
};

export type FreeformManifest = {
  schemaVersion: ManifestSchemaVersion;
  pluginVersion: string;
  minimumClientVersion: string;
  generatedAt: string;
  site: {
    id: number;
    handle: string;
    language: string;
    baseUrl: string;
  };
  form: {
    id: number;
    uid: string;
    handle: string;
    name: string;
    type: string;
    multiPage: boolean;
  };
  endpoints: {
    manifest: { method: string; url: string };
    submit: {
      method: string;
      url: string;
      encodings: string[];
      defaultEncoding: string;
    };
    csrf?: { method: string; url: string; required?: boolean };
  };
  settings: {
    multiPage: boolean;
    ajax: boolean;
    mode: string;
    successBehavior?: string;
    successMessage?: string | null;
  };
  layout: {
    pages: Array<{
      id: number;
      uid: string;
      index: number;
      label: string;
      buttons: Record<string, { label: string } | null>;
      rows: Array<{ uid: string; fields: string[] }>;
    }>;
  };
  fields: Record<string, ManifestFieldDefinition>;
  conditionals: ManifestConditionals;
  security: ManifestSecurity;
  cache?: { visibility: string; maxAge: number };
  requiredExtensions?: Array<{
    name: string;
    package: string;
    version: string;
    severity: string;
    fallback?: string | null;
  }>;
  metadata?: Record<string, unknown>;
  context?: {
    defaultValues?: Record<string, unknown>;
    hiddenFields?: string[];
    lockedFields?: string[];
  };
};

export type ManifestEnvelope = {
  success: boolean;
  data: FreeformManifest;
  meta?: { pluginVersion?: string };
  message?: string;
};
