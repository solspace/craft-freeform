/* eslint-disable @typescript-eslint/no-explicit-any */
import events from '@lib/plugin/constants/event-types';
import { addListeners } from '@lib/plugin/helpers/event-handling';
type Config = {
  applicationId: string;
  locationId: string;
  sandbox: boolean;
  integration: string;
  currency?: string;
  redirectSuccess?: string;
  redirectFailed?: string;
};

type PaymentResponse = {
  success?: boolean;
  payment?: { id?: string };
  errors?: Array<string | { message?: string }>;
};

const SELECTOR = '[data-freeform-square]';
const CARD_SELECTOR = '[data-freeform-square-card]';

declare global {
  interface Window {
    Square?: any;
  }
}

async function loadSquareSDK(sandbox: boolean): Promise<void> {
  if (window.Square) {
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    const host = sandbox ? 'https://sandbox.web.squarecdn.com' : 'https://web.squarecdn.com';
    script.src = `${host}/v1/square.js`;
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error('Failed to load Square SDK'));
    };
    document.head.appendChild(script);
  });
}

function parseConfig(root: HTMLElement): Config | null {
  try {
    const json = root.getAttribute('data-config');
    if (!json) return null;
    return JSON.parse(json) as Config;
  } catch {
    return null;
  }
}

async function createPayment(form: HTMLFormElement, config: Config, token: string) {
  const res = await fetch('/freeform/payments/square/payments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'FF-SQUARE-INTEGRATION': config.integration,
    },
    body: JSON.stringify({
      nonce: token,
      currency: config.currency || 'USD',
      values: Object.fromEntries(new FormData(form) as any),
    }),
  });

  let data: PaymentResponse = {};
  try {
    data = await res.json();
  } catch {
    // ignore JSON parse errors from empty bodies
  }

  return { ok: res.ok && (data?.success ?? true), data } as const;
}

function renderErrors(freeform: any, messages: string[]): void {
  if (!freeform) return;
  freeform._removeMessages();
  freeform._renderFormErrors(messages);
  if (freeform.options?.autoScroll) freeform._scrollToForm();
}

export async function initSquare(): Promise<void> {
  const roots = document.querySelectorAll<HTMLElement>(SELECTOR);
  if (roots.length === 0) {
    return;
  }

  const configs: (Config | null)[] = Array.from(roots).map((root) => parseConfig(root));
  const validConfigs = configs.filter((c): c is Config => !!c);
  if (validConfigs.length === 0) {
    return;
  }

  const firstSandbox = !!validConfigs[0].sandbox;

  await loadSquareSDK(firstSandbox);
  if (!window.Square) {
    return;
  }

  roots.forEach((root) => {
    const config = parseConfig(root);
    if (!config) {
      return;
    }
    const tokenInput = root.querySelector<HTMLInputElement>('input[data-freeform-square-token]');
    const cardMount = root.querySelector<HTMLElement>(CARD_SELECTOR);
    const form = root.closest<HTMLFormElement>('form');
    if (!tokenInput) {
      return;
    }
    if (!cardMount) {
      return;
    }
    if (!form) {
      return;
    }

    try {
      const payments = (window as any).Square.payments(config.applicationId, config.locationId);
      payments.card().then((card: any) => {
        card.attach(cardMount);

        addListeners(form, [events.form.submit], (freeformEvent: any) => {
          freeformEvent.addCallback(async () => {
            if (freeformEvent.isBackButtonPressed) {
              return;
            }

            if (tokenInput.value) {
              return true;
            }

            const result = await card.tokenize();
            const freeform = (form as any).freeform;

            if (!(result?.status === 'OK' && result?.token)) {
              const message =
                result?.errors?.[0]?.message || 'Card tokenization failed. Please check your card details.';
              renderErrors(freeform, [message]);
              return false;
            }

            try {
              const { ok, data } = await createPayment(form, config, result.token);
              if (ok) {
                const paymentId = data?.payment?.id || '';
                tokenInput.value = paymentId || result.token;

                // Store redirect URLs for after form submission
                if (config.redirectSuccess) {
                  (form as any).freeform.squareRedirectSuccess = config.redirectSuccess;
                }
                if (config.redirectFailed) {
                  (form as any).freeform.squareRedirectFailed = config.redirectFailed;
                }

                return true; // Allow form to submit normally
              }

              const messages: string[] = Array.isArray(data?.errors)
                ? (data.errors.map((e) => (typeof e === 'string' ? e : e?.message)).filter(Boolean) as string[])
                : [];
              renderErrors(
                freeform,
                messages.length ? messages : ['Payment failed. Please check your details and try again.']
              );

              if (config.redirectFailed) {
                window.location.href = config.redirectFailed;
                return false;
              }
              return false;
            } catch {
              renderErrors((form as any).freeform, ['Payment error. Please try again.']);

              if (config.redirectFailed) {
                window.location.href = config.redirectFailed;
                return false;
              }
              return false;
            }
          }, 100);
        });

        // Handle redirects after successful form submission
        addListeners(form, [events.form.ajaxSuccess], (freeformEvent: any) => {
          const freeform = (form as any).freeform;
          if (freeform.squareRedirectSuccess && freeformEvent.response?.success) {
            window.location.href = freeform.squareRedirectSuccess;
          }
        });
      });
    } catch {
      // swallow init errors
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initSquare().catch(() => {});
});
