// PayPal SDK integration for Freeform
interface PayPalButtons {
  render(element: Element): void;
}

type PayPalButtonsConfig = {
  style?: Record<string, unknown>;
  createOrder: () => Promise<string> | string;
  onApprove: (data: { orderID: string }) => Promise<void> | void;
  onError?: (err: unknown) => void;
  onCancel?: (_data: unknown) => void;
};

interface PayPalSDK {
  Buttons: (config: PayPalButtonsConfig) => PayPalButtons;
}

// Removed global declaration; use window.paypal safely instead

type Config = {
  required: boolean;
  integration: string;
  clientId: string;
  sandbox: boolean;
  currency?: string;
  finalizeOnSubmit?: boolean;
};

const Q = {
  root: '[data-freeform-paypal-buttons]',
  orderInput: '[data-freeform-paypal-order]',
};

const ENDPOINTS = {
  orders: '/freeform/payments/paypal/orders',
} as const;

const DEBUG = (window as Window & { FREEFORM_DEBUG?: boolean }).FREEFORM_DEBUG === true;

function logError(...args: unknown[]) {
  if (DEBUG) {
    console.error('PayPal:', ...args);
  }
}

function showNotice(root: Element, text: string) {
  const container = root.closest('[data-field-container="payPalPayment"]') || root.parentElement;
  if (!container) return;
  let notice = container.querySelector('[data-ff-paypal-notice]') as HTMLElement | null;
  if (!notice) {
    notice = document.createElement('div');
    notice.setAttribute('data-ff-paypal-notice', 'true');
    notice.style.marginTop = '8px';
    notice.style.color = '#0a7';
    notice.style.fontSize = '0.95em';
    container.appendChild(notice);
  }
  notice.textContent = text;
}

function parseConfig(el: Element): Config | null {
  const attr = el.getAttribute('data-config');
  if (!attr) return null;
  try {
    return JSON.parse(attr);
  } catch {
    return null;
  }
}

type Values = Record<string, string | number | boolean | File>;

type CreateOrderResult = { id: string; status?: string; approve?: string } | null;
async function createOrder(endpoint: string, integration: string, values?: Values): Promise<CreateOrderResult> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'FF-PAYPAL-INTEGRATION': integration,
      },
      credentials: 'same-origin',
      body: values ? JSON.stringify({ values }) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      logError('Order creation failed', res.status, res.statusText, errorText);
      return null;
    }

    const data = (await res.json()) as { id?: string; status?: string; approve?: string };
    return data && data.id ? { id: String(data.id), status: data.status, approve: data.approve } : null;
  } catch (error) {
    logError('Network error during order creation:', error);
    return null;
  }
}

type CaptureOrderResult = { status: string; id: string } | null;
async function captureOrder(
  endpoint: string,
  integration: string,
  orderId: string,
  body?: unknown
): Promise<CaptureOrderResult> {
  try {
    const res = await fetch(`${endpoint}/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'FF-PAYPAL-INTEGRATION': integration,
      },
      credentials: 'same-origin',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errorText = await res.text();
      logError('Order capture failed', res.status, res.statusText, errorText);
      return null;
    }

    const data = (await res.json()) as { status?: string; id?: string };
    return data?.status && data?.id ? { status: String(data.status), id: String(data.id) } : null;
  } catch (error) {
    logError('Network error during order capture:', error);
    return null;
  }
}

// Load PayPal SDK dynamically
function loadPayPalSDK(clientId: string, sandbox: boolean, currency: string = 'USD'): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as Window & { paypal?: PayPalSDK }).paypal) {
      resolve();
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.getElementById('freeform-paypal-sdk');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load PayPal SDK')));
      return;
    }

    const script = document.createElement('script');
    script.id = 'freeform-paypal-sdk';
    const cur = (currency || 'USD').toUpperCase();
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${cur}&intent=capture&components=buttons&enable-funding=venmo,paylater`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      // SDK loaded
      resolve();
    };

    script.onerror = () => {
      logError('Failed to load SDK');
      reject(new Error('Failed to load PayPal SDK'));
    };

    document.head.appendChild(script);
  });
}

// Initialize PayPal buttons for a specific element
async function initializePayPalButtons(root: Element) {
  const config = parseConfig(root);
  if (!config) {
    logError('Could not parse config from element', root);
    return;
  }

  if (!config.clientId) {
    logError('No client ID provided');
    return;
  }

  const form = root.closest('form');
  if (!form) {
    logError('Could not find form element');
    return;
  }

  const hiddenInput = form.querySelector<HTMLInputElement>(Q.orderInput);
  if (!hiddenInput) {
    logError('Could not find hidden order input');
    return;
  }

  // Initialize PayPal buttons
  try {
    // Load SDK first
    await loadPayPalSDK(config.clientId, config.sandbox, config.currency || 'USD');

    // Wait a bit for the SDK to be fully ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    const p = (window as unknown as { paypal?: PayPalSDK }).paypal;
    if (!p) {
      logError('PayPal SDK is not available on window');
      return;
    }

    p.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'paypal',
      },
      createOrder: async () => {
        // Create order

        try {
          // Serialize current form values so server can compute dynamic amount before order create
          const fd = new FormData(form);
          const values: Values = {};
          fd.forEach((v, k) => {
            (values as Record<string, unknown>)[k] = v as unknown as string | number | boolean | File;
          });

          const order = await createOrder(ENDPOINTS.orders, config.integration, values);
          if (!order || !order.id) {
            logError('Failed to create order or no order ID returned', order);
            throw new Error('Failed to create PayPal order');
          }
          // Order created
          hiddenInput.value = order.id;
          return order.id;
        } catch (error) {
          logError('Error in createOrder:', error);
          throw error;
        }
      },
      onApprove: async (data: { orderID: string }) => {
        // Order approved: immediately capture, but do NOT auto-submit
        hiddenInput.value = String(data.orderID || '');
        try {
          const fd = new FormData(form);
          const values: Values = {};
          fd.forEach((v, k) => {
            (values as Record<string, unknown>)[k] = v as unknown as string | number | boolean | File;
          });
          const captureResult = await captureOrder(ENDPOINTS.orders, config.integration, String(data.orderID || ''), {
            values,
          });
          if (captureResult && captureResult.status === 'COMPLETED') {
            showNotice(root, 'Payment completed with PayPal. Click Submit to finish.');
          } else {
            logError('Payment capture failed', captureResult);
            showNotice(root, 'PayPal capture failed. Please try again.');
          }
        } catch (error) {
          logError('Error during payment capture:', error);
          showNotice(root, 'PayPal capture error. Please try again.');
        }
      },
      onError: (err: unknown) => {
        logError('Payment error:', err);
      },
      onCancel: (_data: unknown) => {
        // Payment cancelled
      },
    }).render(root);
  } catch (error) {
    logError('Failed to initialize buttons:', error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const roots = document.querySelectorAll(Q.root);
  // Found PayPal button containers

  if (roots.length === 0) {
    return;
  }

  // Get unique client IDs
  const clientIds = new Set<string>();
  const currencies = new Set<string>();
  roots.forEach((root) => {
    const config = parseConfig(root);
    if (config?.clientId) {
      clientIds.add(config.clientId);
    }
    if (config?.currency) {
      currencies.add(String(config.currency).toUpperCase());
    }
  });

  if (clientIds.size === 0) {
    logError('No valid configurations found');
    return;
  }

  // Load SDK with the first client ID and first currency (all PayPal fields on a page must share one currency)
  const firstClientId = Array.from(clientIds)[0];
  const firstConfig = parseConfig(roots[0]);
  const loadedCurrency = (firstConfig?.currency || 'USD').toUpperCase();
  if (currencies.size > 1) {
    logError(
      'Multiple currencies detected on the same page. Using',
      loadedCurrency,
      'for SDK. Other currencies will be skipped.'
    );
  }

  try {
    await loadPayPalSDK(firstClientId, firstConfig?.sandbox || false, loadedCurrency);
  } catch (error) {
    logError('Failed to load SDK:', error);
    return;
  }

  // Initialize all PayPal button containers
  roots.forEach((root) => {
    const cfg = parseConfig(root);
    const ccy = (cfg?.currency || 'USD').toUpperCase();
    if (ccy !== loadedCurrency) {
      logError(
        'Skipping button init due to currency mismatch. Loaded SDK currency =',
        loadedCurrency,
        'button currency =',
        ccy
      );
      return;
    }
    initializePayPalButtons(root);
  });
});
