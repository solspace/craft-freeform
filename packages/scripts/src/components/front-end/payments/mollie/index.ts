import events from "@lib/plugin/constants/event-types";
import { addListeners } from "@lib/plugin/helpers/event-handling";

import type { MollieConfig } from "./mollie.types";

// Data attribute selector for Mollie hidden input
const SELECTOR = "[data-freeform-mollie]";

// Freeform submit event shape used by addListeners
type FreeformSubmitEvent = Event & {
  addCallback: (fn: () => Promise<boolean>, delay?: number) => void;
  isBackButtonPressed?: boolean;
};

interface MolliePaymentResponse {
  success: boolean;
  paymentId?: string;
  checkoutUrl?: string;
  error?: string;
  [key: string]: unknown;
}

interface FreeformRuntimeApi {
  _removeMessages: () => void;
  _renderFormErrors: (errors: string[]) => void;
  _renderSuccessBanner?: () => void;
  _scrollToForm: () => void;
  options?: { autoScroll?: boolean };
}

// Query-string flag set by the server-side return handler after Mollie checkout.
// Must match MolliePaymentController::PAYMENT_STATUS_PARAM.
const PAYMENT_STATUS_PARAM = "freeformPaymentStatus";
const PAID_STATUSES = ["paid", "authorized"];

function getFreeformRuntime(form: HTMLFormElement): FreeformRuntimeApi | null {
  return (
    (form as unknown as { freeform?: FreeformRuntimeApi }).freeform ?? null
  );
}

function setFormError(form: HTMLFormElement, errors: string[]): void {
  const runtime = getFreeformRuntime(form);
  if (!runtime) return;
  runtime._removeMessages();
  runtime._renderFormErrors(errors);
  if (runtime.options?.autoScroll) runtime._scrollToForm();
}

function getCsrfToken(): string {
  const meta = document.querySelector(
    'meta[name="csrf-token"]',
  ) as HTMLMetaElement | null;
  return meta?.content ?? "";
}

function parseConfig(element: HTMLElement): MollieConfig | null {
  try {
    let json = element.getAttribute("data-mollie-config");
    if (!json) {
      const configElement = element.parentElement?.querySelector(
        "[data-mollie-config]",
      ) as HTMLElement | null;
      json = configElement?.getAttribute("data-mollie-config") || null;
    }
    return json ? (JSON.parse(json) as MollieConfig) : null;
  } catch {
    return null;
  }
}

async function createPayment(
  form: HTMLFormElement,
  config: MollieConfig,
): Promise<{ ok: boolean; data: MolliePaymentResponse }> {
  const formData = new FormData(form);
  const values: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    values[key] = value;
  });

  const paymentData = {
    currency: config.currency,
    description: config.description,
    redirectUrl: config.redirectUrl,
    webhookUrl: config.webhookUrl,
    formId: form.dataset.id,
    values,
    metadata: {
      formId: form.dataset.id,
      fieldHandle: form.querySelector<HTMLInputElement>(SELECTOR)?.name || "",
    },
  };

  try {
    const url = `/freeform/payments/mollie/create?integration=${encodeURIComponent(config.integration)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCsrfToken(),
      },
      body: JSON.stringify(paymentData),
    });

    let data: MolliePaymentResponse = { success: false };
    try {
      data = (await res.json()) as MolliePaymentResponse;
    } catch {
      return {
        ok: false,
        data: { success: false, error: "Invalid JSON response" },
      };
    }

    return { ok: res.ok && data.success === true, data };
  } catch {
    return { ok: false, data: { success: false } };
  }
}

const processedForms = new WeakSet<HTMLFormElement>();

export async function initMollie(): Promise<void> {
  const elements = document.querySelectorAll<HTMLElement>(SELECTOR);
  if (elements.length === 0) {
    return;
  }

  const formsWithMollie = new Map<HTMLFormElement, HTMLElement[]>();
  elements.forEach((element) => {
    const config = parseConfig(element);
    if (!config) {
      return;
    }

    const form = element.closest<HTMLFormElement>("form");
    if (!form) {
      return;
    }

    if (!formsWithMollie.has(form)) {
      formsWithMollie.set(form, []);
    }
    formsWithMollie.get(form)!.push(element);
  });

  formsWithMollie.forEach((mollieElements, form) => {
    if (processedForms.has(form)) {
      return;
    }

    processedForms.add(form);

    // After a successful submit, redirect the browser to the Mollie hosted checkout.
    // The checkout URL is captured client-side during payment creation (below), so this
    // does not depend on the server threading it back through the AJAX response payload.
    addListeners(form, [events.form.ajaxBeforeSuccess], (event: Event) => {
      const checkoutUrl = form.dataset.mollieCheckoutUrl;
      if (!checkoutUrl) {
        return;
      }

      const response = (event as { response?: { success?: boolean } }).response;
      if (response && response.success === false) {
        return;
      }

      // Prevent the default success handling (banner/reset) - we are navigating away.
      event.preventDefault();
      window.location.href = checkoutUrl;
    });

    addListeners(
      form,
      [events.form.submit],
      (freeformEvent: FreeformSubmitEvent) => {
        freeformEvent.addCallback(async () => {
          if (freeformEvent.isBackButtonPressed) {
            return true;
          }

          const mollieInput = form.querySelector<HTMLInputElement>(SELECTOR);
          if (!mollieInput) {
            return true;
          }

          if (mollieInput.value) {
            return true;
          }

          const firstElement = mollieElements[0];
          const config = parseConfig(firstElement);
          if (!config) {
            return true;
          }

          try {
            const { ok, data } = await createPayment(form, config);
            if (ok && data?.checkoutUrl) {
              mollieInput.value = data.paymentId || "pending";
              form.dataset.mollieCheckoutUrl = data.checkoutUrl;
              return true;
            }
            setFormError(form, ["Payment creation failed. Please try again."]);
            return false;
          } catch {
            setFormError(form, ["Payment error. Please try again."]);
            return false;
          }
        }, 100);
      },
    );
  });
}

// Handle the redirect back from Mollie checkout. The server-side return handler has
// already verified the real payment status and set the success flash; here we surface
// the outcome on AJAX forms (non-AJAX forms render the banner server-side) and on any
// failed/canceled payment, then strip the flag so a refresh does not repeat the message.
function handlePaymentReturn(): void {
  const params = new URLSearchParams(window.location.search);
  const status = params.get(PAYMENT_STATUS_PARAM);
  if (!status) {
    return;
  }

  params.delete(PAYMENT_STATUS_PARAM);
  const query = params.toString();
  const cleanUrl = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);

  const form = document.querySelector<HTMLFormElement>("form[data-freeform]");
  if (!form) {
    return;
  }

  const render = (): void => {
    const runtime = getFreeformRuntime(form);
    if (!runtime) {
      return;
    }

    if (PAID_STATUSES.includes(status)) {
      // Non-AJAX forms already render the banner server-side from the submission flash;
      // only AJAX forms need it rendered here. Leave the server-rendered banner untouched
      // otherwise (do not call _removeMessages, which would erase it).
      if (
        form.hasAttribute("data-ajax") &&
        typeof runtime._renderSuccessBanner === "function"
      ) {
        runtime._removeMessages();
        runtime._renderSuccessBanner();
        if (runtime.options?.autoScroll) {
          runtime._scrollToForm();
        }
      }
      return;
    }

    runtime._removeMessages();
    runtime._renderFormErrors([
      "Your payment was not completed. Please try again.",
    ]);
    if (runtime.options?.autoScroll) {
      runtime._scrollToForm();
    }
  };

  if (getFreeformRuntime(form)) {
    render();
  } else {
    form.addEventListener("freeform-ready", render, { once: true });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  void initMollie();
  handlePaymentReturn();
});
