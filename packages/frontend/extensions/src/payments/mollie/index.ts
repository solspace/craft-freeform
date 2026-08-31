import type {
  ExtensionSetupContext,
  ExtensionSubmitContext,
  ExtensionSubmitResultContext,
  FieldMountContext,
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { resolveUrl } from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../../version.js";

type MollieConfig = {
  integration?: string;
  currency?: string;
  required?: boolean;
  paymentUrl?: string;
};

type CheckoutState = {
  checkoutUrl: string;
  baseUrl: string;
};

/** Must match MolliePaymentController::PAYMENT_STATUS_PARAM */
const PAYMENT_STATUS_PARAM = "freeformPaymentStatus";
const PAID_STATUSES = new Set(["paid", "authorized"]);

const checkouts = new Map<string, CheckoutState>();
const fieldBaseUrls = new Map<string, string>();

function supportsMollie(field: ManifestFieldDefinition): boolean {
  return (
    field.type === "mollie" ||
    field.frontend?.extension === "payment.mollie" ||
    field.frontend?.renderer === "payment.mollie"
  );
}

function resolveClientBaseUrl(
  preferred?: string | null,
  fallbackManifestBase?: string | null,
): string {
  if (preferred !== undefined && preferred !== null) {
    return preferred;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return fallbackManifestBase ?? "";
}

function handlePaymentReturn(): void {
  if (typeof window === "undefined") {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const status = params.get(PAYMENT_STATUS_PARAM);
  if (!status) {
    return;
  }

  params.delete(PAYMENT_STATUS_PARAM);
  const query = params.toString();
  const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);

  if (PAID_STATUSES.has(status)) {
    return;
  }

  document.dispatchEvent(
    new CustomEvent("freeform-mollie-payment-return", {
      detail: { status },
    }),
  );
}

/**
 * Mollie hosted-checkout bridge. On final submit Freeform creates a Mollie
 * payment server-side, stores the payment id on the field, then redirects the
 * browser to Mollie — the same flow as classic Freeform templates.
 */
export function createMolliePaymentExtension(): FreeformExtension {
  return {
    name: "payment.mollie",
    version: PACKAGE_VERSION,
    supports: supportsMollie,

    async setup(_context: ExtensionSetupContext) {
      handlePaymentReturn();
    },

    async mount(context: FieldMountContext) {
      if (!supportsMollie(context.field)) {
        return;
      }

      const config = (context.field.frontend?.config ?? {}) as MollieConfig;
      if (!config.integration || !config.paymentUrl) {
        context.element.textContent =
          "Mollie payment configuration is missing.";
        return;
      }

      context.element.replaceChildren();
      context.element.setAttribute(
        "data-freeform-mollie",
        context.field.handle,
      );

      fieldBaseUrls.set(
        context.field.handle,
        resolveClientBaseUrl(context.baseUrl, context.manifest.site.baseUrl),
      );

      return () => {
        checkouts.delete(context.field.handle);
        fieldBaseUrls.delete(context.field.handle);
        context.element.replaceChildren();
      };
    },

    async beforeSubmit(context: ExtensionSubmitContext) {
      if (context.intent !== "submit") {
        return;
      }

      for (const field of Object.values(context.manifest.fields)) {
        if (!supportsMollie(field)) {
          continue;
        }

        const config = (field.frontend?.config ?? {}) as MollieConfig;
        const required = Boolean(config.required ?? field.required);
        const existing = context.values[field.handle];
        if (existing !== undefined && existing !== null && existing !== "") {
          continue;
        }

        if (!config.integration || !config.paymentUrl) {
          throw new Error("Mollie payment configuration is missing.");
        }

        // Prefer the Freeform client's baseUrl (same-origin proxy) over
        // manifest.site.baseUrl, which points at Craft and will CORS-fail.
        const baseUrl = resolveClientBaseUrl(
          context.baseUrl ?? fieldBaseUrls.get(field.handle),
          context.manifest.site.baseUrl,
        );
        const paymentPath = resolveUrl(baseUrl, config.paymentUrl);
        const paymentUrl = new URL(
          paymentPath,
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost",
        );
        paymentUrl.searchParams.set("integration", config.integration);

        const response = await fetch(paymentUrl.toString(), {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currency: config.currency ?? "EUR",
            values: context.values,
            // Same-origin SPA origin so Mollie returns through the Vite/Next
            // proxy and Craft session cookies still match.
            returnOrigin:
              typeof window !== "undefined"
                ? window.location.origin
                : undefined,
          }),
        });

        const result = (await response.json()) as {
          success?: boolean;
          paymentId?: string;
          checkoutUrl?: string;
          error?: string;
          errors?: Array<string | { message?: string }>;
        };

        if (!response.ok || !result.success || !result.checkoutUrl) {
          const error = result.errors?.[0];
          throw new Error(
            typeof error === "string"
              ? error
              : (error?.message ??
                  result.error ??
                  "Mollie payment creation failed."),
          );
        }

        const paymentId = result.paymentId || "pending";
        context.values[field.handle] = paymentId;
        checkouts.set(field.handle, {
          checkoutUrl: result.checkoutUrl,
          baseUrl,
        });

        if (required && !paymentId) {
          throw new Error("Complete the Mollie payment before submitting.");
        }
      }
    },

    async afterSubmit(context: ExtensionSubmitResultContext) {
      if (context.intent !== "submit" || !context.response.success) {
        return;
      }

      for (const field of Object.values(context.manifest.fields)) {
        if (!supportsMollie(field)) {
          continue;
        }

        const stashed = checkouts.get(field.handle);
        const redirectUrl =
          stashed?.checkoutUrl ?? context.response.redirect?.url;
        if (!redirectUrl) {
          continue;
        }

        checkouts.delete(field.handle);
        window.location.assign(redirectUrl);
        throw new MolliePaymentRedirectError(redirectUrl);
      }
    },
  };
}

export class MolliePaymentRedirectError extends Error {
  readonly url: string;

  constructor(url: string) {
    super("Redirecting to Mollie to complete payment.");
    this.name = "MolliePaymentRedirectError";
    this.url = url;
  }
}

export const molliePaymentExtension = createMolliePaymentExtension();
