// PayPal SDK integration for Freeform
import {
  loadScript,
  type PayPalNamespace as PayPalSDK,
} from "@paypal/paypal-js";

// Declare globals once for typing
declare global {
  interface Window {
    paypal?: PayPalSDK;
    FREEFORM_DEBUG?: boolean;
  }
}

// Cache for different PayPal SDK configurations
const sdkCache = new Map<string, PayPalSDK>();

type Config = {
  required: boolean;
  integration: string;
  clientId: string;
  sandbox: boolean;
  currency?: string;
  finalizeOnSubmit?: boolean;
};

const SELECTORS = {
  root: "[data-freeform-paypal-buttons]",
  orderInput: "[data-freeform-paypal-order]",
};

const ENDPOINTS = {
  orders: "/freeform/payments/paypal/orders",
} as const;

const DEBUG = window.FREEFORM_DEBUG === true;

function logError(...args: unknown[]) {
  if (DEBUG) {
    console.error("PayPal:", ...args);
  }
}

function showNotice(root: Element, text: string) {
  const container =
    root.closest('[data-field-type="paypal"]') || root.parentElement;
  if (!container) return;
  let notice = container.querySelector(
    "[data-ff-paypal-notice]",
  ) as HTMLElement | null;
  if (!notice) {
    notice = document.createElement("div");
    notice.setAttribute("data-ff-paypal-notice", "true");
    notice.style.marginTop = "8px";
    notice.style.color = "#0a7";
    notice.style.fontSize = "0.95em";
    container.appendChild(notice);
  }
  notice.textContent = text;
}

function parseConfig(el: Element): Config | null {
  const attr = el.getAttribute("data-config");
  if (!attr) return null;
  try {
    return JSON.parse(attr);
  } catch {
    return null;
  }
}

type Values = Record<string, FormDataEntryValue>;

type CreateOrderResult = {
  id: string;
  status?: string;
  approve?: string;
};
async function createOrder(
  endpoint: string,
  integration: string,
  values: Values,
): Promise<CreateOrderResult | null> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "FF-PAYPAL-INTEGRATION": integration,
      },
      credentials: "same-origin",
      body: JSON.stringify({ values }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logError("Order creation failed", res.status, res.statusText, errorText);
      return null;
    }

    const data = (await res.json()) as {
      id?: string;
      status?: string;
      approve?: string;
    };
    return data?.id
      ? { id: String(data.id), status: data.status, approve: data.approve }
      : null;
  } catch (error) {
    logError("Network error during order creation:", error);
    return null;
  }
}

type CaptureOrderResult = {
  status: string;
  id: string;
};
async function captureOrder(
  endpoint: string,
  integration: string,
  orderId: string,
  body: unknown,
): Promise<CaptureOrderResult | null> {
  try {
    const res = await fetch(`${endpoint}/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "FF-PAYPAL-INTEGRATION": integration,
      },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      logError("Order capture failed", res.status, res.statusText, errorText);
      return null;
    }

    const data = (await res.json()) as { status?: string; id?: string };
    return data?.status && data?.id
      ? { status: String(data.status), id: String(data.id) }
      : null;
  } catch (error) {
    logError("Network error during order capture:", error);
    return null;
  }
}

// Load PayPal SDK dynamically with proper caching for different configurations
async function getPayPalSDK(
  clientId: string,
  sandbox: boolean,
  currency: string,
): Promise<PayPalSDK> {
  // Create a cache key based on configuration
  const cacheKey = `${clientId}-${sandbox ? "sandbox" : "live"}-${currency}`;

  // Return cached SDK if available
  if (sdkCache.has(cacheKey)) {
    return sdkCache.get(cacheKey)!;
  }

  // Load new SDK instance for this configuration
  const paypalNamespace = await loadScript({
    clientId,
    currency: (currency || "USD").toUpperCase(),
    components: "buttons",
    intent: "capture",
    enableFunding: "venmo,paylater",
  });

  if (!paypalNamespace) {
    throw new Error("PayPal SDK failed to load");
  }

  // Cache the SDK instance
  sdkCache.set(cacheKey, paypalNamespace);

  // Also set global for backward compatibility (use first loaded instance)
  if (!window.paypal) {
    window.paypal = paypalNamespace;
  }

  return paypalNamespace;
}

// Initialize PayPal buttons for a specific element
async function initializePayPalButtons(root: HTMLElement) {
  const config = parseConfig(root);
  if (!config) {
    logError("Could not parse config from element", root);
    return;
  }

  if (!config.clientId) {
    logError("No client ID provided");
    return;
  }

  const form = root.closest<HTMLFormElement>("form");
  if (!form) {
    logError("Could not find form element");
    return;
  }

  const hiddenInput = form.querySelector<HTMLInputElement>(
    SELECTORS.orderInput,
  );
  if (!hiddenInput) {
    logError("Could not find hidden order input");
    return;
  }

  // Initialize PayPal buttons
  try {
    const paypalSDK = await getPayPalSDK(
      config.clientId,
      config.sandbox,
      config.currency || "USD",
    );

    paypalSDK
      .Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
        },
        createOrder: async () => {
          // Create order

          try {
            // Serialize current form values so server can compute dynamic amount before order create
            const formData = new FormData(form);
            const values: Values = {};
            formData.forEach((value, key) => {
              values[key] = value;
            });

            const order = await createOrder(
              ENDPOINTS.orders,
              config.integration,
              values,
            );
            if (!order?.id) {
              logError("Failed to create order or no order ID returned", order);
              throw new Error("Failed to create PayPal order");
            }
            // Order created
            hiddenInput.value = order.id;
            return order.id;
          } catch (error) {
            logError("Error in createOrder:", error);
            throw error;
          }
        },
        onApprove: async (data: { orderID: string }) => {
          // Order approved: immediately capture, but do NOT auto-submit
          hiddenInput.value = String(data.orderID || "");
          try {
            const formData = new FormData(form);
            const values: Values = {};
            formData.forEach((value, key) => {
              values[key] = value;
            });
            const captureResult = await captureOrder(
              ENDPOINTS.orders,
              config.integration,
              String(data.orderID || ""),
              {
                values,
              },
            );
            if (captureResult && captureResult.status === "COMPLETED") {
              showNotice(
                root,
                "Payment completed with PayPal. Click Submit to finish.",
              );
            } else {
              logError("Payment capture failed", captureResult);
              showNotice(root, "PayPal capture failed. Please try again.");
            }
          } catch (error) {
            logError("Error during payment capture:", error);
            showNotice(root, "PayPal capture error. Please try again.");
          }
        },
        onError: (err: unknown) => {
          logError("Payment error:", err);
        },
        onCancel: (_data: unknown) => {
          // Payment cancelled
        },
      })
      .render(root);
  } catch (error) {
    logError("Failed to initialize buttons:", error);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const roots = document.querySelectorAll<HTMLElement>(SELECTORS.root);
  // Found PayPal button containers

  if (roots.length === 0) {
    return;
  }

  // Group roots by clientId to load separate SDKs
  const rootsByClientId = new Map<string, HTMLElement[]>();
  roots.forEach((root) => {
    const config = parseConfig(root);
    if (config?.clientId) {
      if (!rootsByClientId.has(config.clientId)) {
        rootsByClientId.set(config.clientId, []);
      }
      rootsByClientId.get(config.clientId)!.push(root);
    }
  });

  if (rootsByClientId.size === 0) {
    logError("No valid configurations found");
    return;
  }

  // Load SDK and initialize buttons for each clientId
  rootsByClientId.forEach(async (clientRoots, clientId) => {
    try {
      // Get the first config for this clientId to determine sandbox setting
      const firstConfig = parseConfig(clientRoots[0]);
      if (!firstConfig) return;

      // Load SDK for this clientId
      await getPayPalSDK(
        clientId,
        firstConfig.sandbox,
        firstConfig.currency || "USD",
      );

      // Initialize all buttons for this clientId
      clientRoots.forEach((root) => {
        initializePayPalButtons(root);
      });
    } catch (error) {
      logError(`Failed to load SDK for clientId ${clientId}:`, error);
      // Continue with other clientIds even if one fails
    }
  });
});
