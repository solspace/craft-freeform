import type { SubmitIntent } from "./manifest.js";

export type SubmitContext = {
  token?: string | null;
  draftToken?: string | null;
  draftKey?: string | null;
  stateToken?: string | null;
  /** Browser page URL — used by Mollie (and similar) return handling */
  sourceUrl?: string | null;
};

export type SubmitMeta = {
  idempotencyKey?: string;
  client?: string;
  clientVersion?: string;
  honeypot?: { name: string; value: string };
  javascriptTest?: { name: string; value: string };
  captcha?: { name: string; value: string };
  captchas?: Array<{ name: string; value: string }>;
};

export type SubmitRequest = {
  values: Record<string, unknown>;
  intent: SubmitIntent;
  context?: SubmitContext;
  meta?: SubmitMeta;
};

export type SubmitStatus =
  | "submitted"
  | "validated"
  | "validation_failed"
  | "validation_error"
  | "page_valid"
  | "draft_saved"
  | "not_implemented"
  | "spam_rejected"
  | "captcha_failed"
  | "payment_action_required"
  | "idempotency_conflict"
  | "context_required"
  | "context_invalid"
  | "csrf_failed"
  | "error";

export type SubmitErrors = {
  fields: Record<string, string[]>;
  form: string[];
  page: string[];
};

export type SubmitResponse = {
  success: boolean;
  status: SubmitStatus | string;
  complete: boolean;
  submission?: {
    id: number;
    uid: string;
    token?: string | null;
  } | null;
  message?: string | null;
  redirect?: { url: string; delay?: number } | null;
  actions?: unknown[];
  page?: { currentIndex?: number } | null;
  state?: {
    values?: Record<string, unknown>;
    pageIndex?: number;
    token?: string | null;
  } | null;
  draft?: {
    token: string;
    key: string;
    resumeUrl?: string | null;
    expiresAt?: string | null;
  } | null;
  errors: SubmitErrors;
};

export type SubmitFileMap = Record<string, File | File[] | Blob | Blob[]>;
