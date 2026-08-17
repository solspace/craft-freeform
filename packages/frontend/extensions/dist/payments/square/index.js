import { resolveUrl } from "@solspace/freeform-core";
import { PACKAGE_VERSION } from "../../version.js";
const states = new Map();
function supportsSquare(field) {
    return (field.type === "square" ||
        field.frontend?.extension === "payment.square" ||
        field.frontend?.renderer === "payment.square");
}
async function loadSquareSdk(sandbox) {
    if (window.Square) {
        return window.Square;
    }
    const host = sandbox
        ? "https://sandbox.web.squarecdn.com"
        : "https://web.squarecdn.com";
    await new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `${host}/v1/square.js`;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Unable to load the Square SDK."));
        document.head.append(script);
    });
    if (!window.Square) {
        throw new Error("Square SDK did not initialize.");
    }
    return window.Square;
}
/**
 * Square Web Payments SDK bridge. Tokenization happens in the browser; the
 * nonce, current form values, and amount calculation are sent to Craft, where
 * Freeform creates the charge with its server-side Square access token.
 */
export function createSquarePaymentExtension() {
    return {
        name: "payment.square",
        version: PACKAGE_VERSION,
        supports: supportsSquare,
        async mount(context) {
            if (!supportsSquare(context.field)) {
                return;
            }
            const config = (context.field.frontend?.config ?? {});
            if (!config.applicationId ||
                !config.locationId ||
                !config.integration ||
                !config.paymentUrl) {
                context.element.textContent =
                    "Square payment configuration is missing.";
                return;
            }
            const Square = await loadSquareSdk(Boolean(config.sandbox));
            const card = await Square.payments(config.applicationId, config.locationId).card();
            context.element.replaceChildren();
            await card.attach(context.element);
            states.set(context.field.handle, {
                card,
                config: config,
                baseUrl: context.baseUrl ?? context.manifest.site.baseUrl,
            });
            return () => {
                states.delete(context.field.handle);
                void card.destroy?.();
                context.element.replaceChildren();
            };
        },
        async beforeSubmit(context) {
            if (context.intent !== "submit") {
                return;
            }
            for (const field of Object.values(context.manifest.fields)) {
                if (!supportsSquare(field)) {
                    continue;
                }
                const state = states.get(field.handle);
                if (!state) {
                    throw new Error("Square payment is still loading.");
                }
                const tokenized = await state.card.tokenize();
                if (tokenized.status !== "OK" || !tokenized.token) {
                    throw new Error(tokenized.errors?.[0]?.message ??
                        "Card tokenization failed. Please check your details.");
                }
                const response = await fetch(resolveUrl(state.baseUrl, state.config.paymentUrl), {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        "FF-SQUARE-INTEGRATION": state.config.integration,
                    },
                    body: JSON.stringify({
                        nonce: tokenized.token,
                        currency: state.config.currency ?? "USD",
                        values: context.values,
                    }),
                });
                const result = (await response.json());
                if (!response.ok || !result.success || !result.payment?.id) {
                    const error = result.errors?.[0];
                    throw new Error(typeof error === "string"
                        ? error
                        : (error?.message ?? "Square payment failed."));
                }
                // The payment resource ID is submitted to Freeform for PaymentRecord
                // finalization on the normal headless submit that follows.
                context.values[field.handle] = result.payment.id;
            }
        },
    };
}
export const squarePaymentExtension = createSquarePaymentExtension();
