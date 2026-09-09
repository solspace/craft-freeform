import type {
  ExtensionSubmitContext,
  FieldMountContext,
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { resolveUrl } from "@solspace/freeform-core";
import {
  loadStripe,
  type Stripe,
  type StripeElements,
} from "@stripe/stripe-js";
import { PACKAGE_VERSION } from "../../version.js";

type StripeConfig = {
  publishableKey?: string | null;
  integration?: string;
  site?: string;
  theme?: "stripe" | "night" | "flat";
  layout?: "tabs" | "accordion" | "accordion-radios";
  floatingLabels?: boolean;
  intentUrl?: string;
  amountUrlTemplate?: string;
  checkpointUrl?: string;
  amountFields?: string[];
};

type PaymentState = {
  stripe: Stripe;
  elements: StripeElements;
  paymentIntentId: string;
  integration: string;
  checkpointUrl: string;
  amountUrlTemplate?: string;
  amountFields: string[];
  baseUrl: string;
  site?: string;
  csrfToken?: string;
  required: boolean;
  getValues: () => Record<string, unknown>;
};

const states = new Map<string, PaymentState>();

function supportsStripe(field: ManifestFieldDefinition): boolean {
  return (
    field.type === "stripe" ||
    field.frontend?.extension === "payment.stripe" ||
    field.frontend?.renderer === "payment.stripe"
  );
}

function config(field: ManifestFieldDefinition): StripeConfig {
  return (field.frontend?.config ?? {}) as StripeConfig;
}

function paymentLayout(layout: StripeConfig["layout"]) {
  if (layout === "accordion-radios") {
    return {
      type: "accordion" as const,
      defaultCollapsed: false,
      radios: true,
      spacedAccordionItems: false,
    };
  }

  if (layout === "accordion") {
    return {
      type: "accordion" as const,
      defaultCollapsed: false,
      radios: false,
      spacedAccordionItems: true,
    };
  }

  return { type: "tabs" as const };
}

async function readCsrfToken(
  context: FieldMountContext,
): Promise<{ value: string } | null> {
  const url =
    context.manifest.security.csrf?.tokenEndpoint ??
    context.manifest.endpoints.csrf?.url;
  if (!url) {
    return null;
  }

  const response = await fetch(resolveUrl(context.baseUrl ?? "", url), {
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  const json = (await response.json()) as {
    csrf?: { value?: string };
  };

  return json.csrf?.value ? { value: json.csrf.value } : null;
}

async function updatePaymentAmount(
  state: PaymentState,
  values: Record<string, unknown>,
): Promise<void> {
  if (!state.amountUrlTemplate || state.amountFields.length === 0) {
    return;
  }

  const amountUrl = state.amountUrlTemplate.replace(
    "{paymentIntentId}",
    encodeURIComponent(state.paymentIntentId),
  );

  const response = await fetch(resolveUrl(state.baseUrl, amountUrl), {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "FF-STRIPE-INTEGRATION": state.integration,
      ...(state.csrfToken ? { "X-CSRF-Token": state.csrfToken } : {}),
    },
    body: JSON.stringify({
      values,
      integration: state.integration,
      site: state.site ?? "",
    }),
  });

  const updated = (await response.json()) as {
    id?: string;
    client_secret?: string;
    message?: string;
    errors?: string[];
    amount?: number;
  };

  if (!response.ok) {
    throw new Error(
      updated.errors?.[0] ??
        updated.message ??
        "Unable to update the payment amount.",
    );
  }

  // Subscription amount changes recreate the PaymentIntent. Force the user to
  // remount payment details against the new client secret.
  if (updated.client_secret) {
    throw new Error(
      "Your payment amount changed. Please re-enter your payment details.",
    );
  }

  await state.elements.fetchUpdates();
}

/**
 * Stripe Payment Element bridge.
 *
 * Covers:
 * - successful cards (confirm + classic callback finalization)
 * - 3DS / redirect cards (return_url → Stripe callback)
 * - failed cards (Stripe error messages thrown into form submit)
 * - dynamic amounts (server amount update before confirm)
 * - multipage (payment only runs on final submit intent)
 */
export function createStripePaymentExtension(): FreeformExtension {
  return {
    name: "payment.stripe",
    version: PACKAGE_VERSION,
    supports: supportsStripe,

    async mount(context: FieldMountContext) {
      if (!supportsStripe(context.field)) {
        return;
      }

      const options = config(context.field);
      if (
        !options.publishableKey ||
        !options.integration ||
        !options.intentUrl ||
        !options.checkpointUrl
      ) {
        context.element.textContent =
          "Stripe payment configuration is missing.";
        return;
      }

      const stripe = await loadStripe(options.publishableKey);
      if (!stripe) {
        context.element.textContent = "Unable to load Stripe.";
        return;
      }

      const csrf = await readCsrfToken(context);
      const formValues = context.getValues?.() ?? {};
      const response = await fetch(
        resolveUrl(context.baseUrl ?? "", options.intentUrl),
        {
          method: "POST",
          credentials: "include",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            "FF-STRIPE-INTEGRATION": options.integration,
            ...(csrf ? { "X-CSRF-Token": csrf.value } : {}),
          },
          body: JSON.stringify({
            values: formValues,
            integration: options.integration,
            site: options.site ?? "",
          }),
        },
      );
      const payment = (await response.json()) as {
        id?: string;
        secret?: string;
        errors?: string[];
        message?: string;
      };
      if (!response.ok || !payment.id || !payment.secret) {
        context.element.textContent =
          payment.errors?.[0] ??
          payment.message ??
          "Unable to create Stripe payment.";
        return;
      }

      const elements = stripe.elements({
        clientSecret: payment.secret,
        appearance: {
          theme: options.theme ?? "stripe",
          labels: options.floatingLabels ? "floating" : "above",
        },
      });
      const paymentElement = elements.create("payment", {
        layout: paymentLayout(options.layout),
      });
      context.element.replaceChildren();
      paymentElement.mount(context.element);
      context.setValue(payment.id);

      const state: PaymentState = {
        stripe,
        elements,
        paymentIntentId: payment.id,
        integration: options.integration,
        checkpointUrl: options.checkpointUrl,
        amountUrlTemplate: options.amountUrlTemplate,
        amountFields: options.amountFields ?? [],
        baseUrl: context.baseUrl ?? context.manifest.site.baseUrl,
        site: options.site,
        csrfToken: csrf?.value,
        required: context.field.required,
        getValues: () => context.getValues?.() ?? {},
      };
      states.set(context.field.handle, state);

      const onAmountFieldChange = () => {
        void updatePaymentAmount(state, state.getValues()).catch(
          (error: unknown) => {
            const message =
              error instanceof Error
                ? error.message
                : "Unable to update the payment amount.";
            context.element.setAttribute("data-freeform-stripe-error", message);
          },
        );
      };

      for (const handle of state.amountFields) {
        document
          .querySelectorAll(
            `[name="${CSS.escape(handle)}"], [name="${CSS.escape(handle)}[]"]`,
          )
          .forEach((element) => {
            element.addEventListener("change", onAmountFieldChange);
            element.addEventListener("input", onAmountFieldChange);
          });
      }

      // If amount fields already have values (e.g. previous multipage step),
      // sync the PaymentIntent immediately after create.
      if (state.amountFields.some((handle) => formValues[handle])) {
        void updatePaymentAmount(state, formValues).catch(() => {
          // Keep the created Intent; submit will retry the amount update.
        });
      }

      return () => {
        for (const handle of state.amountFields) {
          document
            .querySelectorAll(
              `[name="${CSS.escape(handle)}"], [name="${CSS.escape(handle)}[]"]`,
            )
            .forEach((element) => {
              element.removeEventListener("change", onAmountFieldChange);
              element.removeEventListener("input", onAmountFieldChange);
            });
        }
        states.delete(context.field.handle);
        paymentElement.unmount();
        context.element.replaceChildren();
      };
    },

    async beforeSubmit(context: ExtensionSubmitContext) {
      // Multipage: Back/Next/validate/saveDraft never charge.
      if (context.intent !== "submit") {
        return;
      }

      for (const field of Object.values(context.manifest.fields)) {
        if (!supportsStripe(field)) {
          continue;
        }

        const state = states.get(field.handle);
        const hasValue = Boolean(context.values[field.handle]);

        // Optional empty payment fields are skipped, matching classic Freeform.
        if (!state) {
          if (field.required || hasValue) {
            throw new Error("Stripe payment is still loading.");
          }
          continue;
        }

        try {
          await updatePaymentAmount(state, context.values);
        } catch (error) {
          throw new Error(
            error instanceof Error
              ? error.message
              : "Unable to update the payment amount.",
          );
        }

        const checkpoint = await fetch(
          resolveUrl(state.baseUrl, state.checkpointUrl),
          {
            method: "POST",
            credentials: "include",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              ...(state.csrfToken ? { "X-CSRF-Token": state.csrfToken } : {}),
            },
            body: JSON.stringify({
              values: context.values,
              intent: context.intent,
              context: context.context,
              meta: context.meta,
              integration: state.integration,
              paymentIntentId: state.paymentIntentId,
            }),
          },
        );

        if (!checkpoint.ok) {
          let message =
            "Unable to prepare the payment. Please review the form and try again.";
          try {
            const body = (await checkpoint.json()) as {
              message?: string;
              errors?: { form?: string[] };
            };
            message = body.errors?.form?.[0] ?? body.message ?? message;
          } catch {
            // Keep the generic message when the body is not JSON.
          }
          throw new Error(message);
        }

        const submitted = await state.elements.submit();
        if (submitted.error) {
          // Failed / incomplete card details.
          throw new Error(
            submitted.error.message ?? "Unable to submit payment details.",
          );
        }

        const returnUrl = new URL(
          "/freeform/payments/stripe/callback",
          state.baseUrl,
        );
        returnUrl.searchParams.set("integration", state.integration);
        returnUrl.searchParams.set("stripe_token", state.paymentIntentId);
        if (state.site) {
          returnUrl.searchParams.set("site", state.site);
        }

        const confirmation = await state.stripe.confirmPayment({
          elements: state.elements,
          confirmParams: { return_url: returnUrl.toString() },
          redirect: "if_required",
        });

        if (confirmation.error) {
          // Declined cards, authentication failures, etc.
          throw new Error(
            confirmation.error.message ?? "Unable to confirm the payment.",
          );
        }

        // Successful card without redirect, or after local confirmation:
        // finalize through the existing Stripe callback so webhook + PaymentRecord
        // behavior stay identical to classic Freeform. 3DS cards redirect here too.
        if (confirmation.paymentIntent?.id) {
          returnUrl.searchParams.set(
            "payment_intent",
            confirmation.paymentIntent.id,
          );
        }
        window.location.assign(returnUrl.toString());
        // Halt the normal headless submit; Craft/Stripe callback finalizes.
        throw new StripePaymentRedirectError(returnUrl.toString());
      }
    },
  };
}

export class StripePaymentRedirectError extends Error {
  readonly url: string;

  constructor(url: string) {
    super("Redirecting to complete payment.");
    this.name = "StripePaymentRedirectError";
    this.url = url;
  }
}

export const stripePaymentExtension = createStripePaymentExtension();
