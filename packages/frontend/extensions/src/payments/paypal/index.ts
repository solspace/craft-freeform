import {
  loadScript,
  type PayPalNamespace as PayPalSDK,
} from "@paypal/paypal-js";
import type {
  ExtensionSubmitContext,
  FieldMountContext,
  FreeformExtension,
  ManifestFieldDefinition,
} from "@solspace/freeform-core";
import { resolveUrl } from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../../version.js";

type PayPalConfig = {
  clientId?: string | null;
  sandbox?: boolean;
  integration?: string;
  currency?: string;
  required?: boolean;
  orderUrl?: string;
};

type CreateOrderResult = {
  id: string;
  status?: string;
};

type CaptureOrderResult = {
  status: string;
  id: string;
};

const sdkCache = new Map<string, PayPalSDK>();

function supportsPayPal(field: ManifestFieldDefinition): boolean {
  return (
    field.type === "paypal" ||
    field.frontend?.extension === "payment.paypal" ||
    field.frontend?.renderer === "payment.paypal"
  );
}

function showNotice(
  root: HTMLElement,
  text: string,
  tone: "muted" | "success" | "error" = "success",
): void {
  let notice = root.querySelector(
    "[data-ff-paypal-notice]",
  ) as HTMLElement | null;
  if (!notice) {
    notice = document.createElement("div");
    notice.setAttribute("data-ff-paypal-notice", "true");
    notice.style.marginTop = "8px";
    notice.style.fontSize = "0.95em";
    root.append(notice);
  }
  const colors = { muted: "#555", success: "#0a7", error: "#b00020" };
  notice.style.color = colors[tone];
  notice.textContent = text;
}

async function getPayPalSdk(
  clientId: string,
  sandbox: boolean,
  currency: string,
): Promise<PayPalSDK> {
  const cacheKey = `${clientId}-${sandbox ? "sandbox" : "live"}-${currency}`;
  const cached = sdkCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const paypalNamespace = await loadScript({
    clientId,
    currency: currency.toUpperCase(),
    components: "buttons",
    intent: "capture",
    enableFunding: "venmo,paylater",
  });

  if (!paypalNamespace) {
    throw new Error("PayPal SDK failed to load.");
  }

  sdkCache.set(cacheKey, paypalNamespace);
  return paypalNamespace;
}

async function createOrder(
  orderUrl: string,
  integration: string,
  values: Record<string, unknown>,
): Promise<CreateOrderResult> {
  const response = await fetch(orderUrl, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "FF-PAYPAL-INTEGRATION": integration,
    },
    body: JSON.stringify({ values }),
  });

  const data = (await response.json()) as {
    id?: string;
    status?: string;
    errors?: Array<string | { message?: string }>;
  };

  if (!response.ok || !data.id) {
    const error = data.errors?.[0];
    throw new Error(
      typeof error === "string"
        ? error
        : (error?.message ?? "Failed to create PayPal order."),
    );
  }

  return { id: String(data.id), status: data.status };
}

async function captureOrder(
  orderUrl: string,
  integration: string,
  orderId: string,
  values: Record<string, unknown>,
): Promise<CaptureOrderResult> {
  const response = await fetch(`${orderUrl}/${orderId}/capture`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "FF-PAYPAL-INTEGRATION": integration,
    },
    body: JSON.stringify({ values }),
  });

  const data = (await response.json()) as {
    id?: string;
    status?: string;
    errors?: Array<string | { message?: string }>;
  };

  if (!response.ok || !data.id || !data.status) {
    const error = data.errors?.[0];
    throw new Error(
      typeof error === "string"
        ? error
        : (error?.message ?? "PayPal capture failed."),
    );
  }

  return { id: String(data.id), status: String(data.status) };
}

/**
 * PayPal Buttons bridge. Visitors approve payment in the PayPal UI first;
 * Freeform then captures via existing Craft routes and submits the order id
 * as the field value (same finalization path as classic forms).
 */
export function createPayPalPaymentExtension(): FreeformExtension {
  return {
    name: "payment.paypal",
    version: PACKAGE_VERSION,
    supports: supportsPayPal,

    async mount(context: FieldMountContext) {
      if (!supportsPayPal(context.field)) {
        return;
      }

      const config = (context.field.frontend?.config ?? {}) as PayPalConfig;
      if (!config.clientId || !config.integration || !config.orderUrl) {
        context.element.textContent =
          "PayPal payment configuration is missing.";
        return;
      }

      const currency = (config.currency ?? "USD").toUpperCase();
      const baseUrl = context.baseUrl ?? context.manifest.site.baseUrl;
      const orderUrl = resolveUrl(baseUrl, config.orderUrl);

      const paypal = await getPayPalSdk(
        config.clientId,
        Boolean(config.sandbox),
        currency,
      );

      if (!paypal.Buttons) {
        context.element.textContent = "PayPal Buttons SDK is unavailable.";
        return;
      }

      context.element.replaceChildren();
      const buttonsHost = document.createElement("div");
      buttonsHost.setAttribute("data-freeform-paypal-buttons", "true");
      context.element.append(buttonsHost);

      const buttons = paypal.Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
        },
        createOrder: async () => {
          const values = context.getValues?.() ?? {};
          const order = await createOrder(
            orderUrl,
            config.integration as string,
            values,
          );
          context.setValue(order.id);
          return order.id;
        },
        onApprove: async (data) => {
          const orderId = String(data.orderID ?? "");
          context.setValue(orderId);
          showNotice(context.element, "Processing your payment…", "muted");

          try {
            const values = context.getValues?.() ?? {};
            const capture = await captureOrder(
              orderUrl,
              config.integration as string,
              orderId,
              values,
            );

            if (capture.status !== "COMPLETED") {
              showNotice(
                context.element,
                "PayPal capture failed. Please try again.",
                "error",
              );
              return;
            }

            context.setValue(orderId);

            if (context.requestSubmit) {
              showNotice(
                context.element,
                "Payment complete. Your form is being submitted automatically.",
                "success",
              );
              await context.requestSubmit();
              return;
            }

            showNotice(
              context.element,
              "Payment completed with PayPal. Click Submit to finish.",
              "success",
            );
          } catch (error) {
            showNotice(
              context.element,
              error instanceof Error
                ? error.message
                : "PayPal capture error. Please try again.",
              "error",
            );
          }
        },
        onError: () => {
          showNotice(
            context.element,
            "PayPal reported an error. Please try again.",
            "error",
          );
        },
      });

      await buttons.render(buttonsHost);

      return () => {
        try {
          buttons.close?.();
        } catch {
          // PayPal may throw if already closed.
        }
        context.element.replaceChildren();
      };
    },

    async beforeSubmit(context: ExtensionSubmitContext) {
      if (context.intent !== "submit") {
        return;
      }

      for (const field of Object.values(context.manifest.fields)) {
        if (!supportsPayPal(field)) {
          continue;
        }

        const config = (field.frontend?.config ?? {}) as PayPalConfig;
        const required = Boolean(config.required ?? field.required);
        const value = context.values[field.handle];
        if (
          required &&
          (value === undefined || value === null || value === "")
        ) {
          throw new Error("Complete the PayPal payment before submitting.");
        }
      }
    },
  };
}

export const paypalPaymentExtension = createPayPalPaymentExtension();
