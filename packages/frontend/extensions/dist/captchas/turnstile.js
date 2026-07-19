import { inferCaptchaProvider, loadScriptOnce, waitForValue, } from "./shared.js";
function getCaptchas(manifestCaptchas) {
    return (manifestCaptchas ?? []).filter((captcha) => inferCaptchaProvider(captcha) === "turnstile");
}
async function ensureTurnstile() {
    await loadScriptOnce("https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit", "ff-turnstile-script");
    if (!window.turnstile) {
        throw new Error("Cloudflare Turnstile failed to initialize.");
    }
    return window.turnstile;
}
export function createTurnstileExtension() {
    const instances = new Map();
    const tokens = new Map();
    return {
        name: "captcha.turnstile",
        version: "0.1.0-beta.1",
        async mountCaptcha({ captcha, element }) {
            if (inferCaptchaProvider(captcha) !== "turnstile") {
                return;
            }
            if (!captcha.siteKey) {
                throw new Error("Turnstile site key is missing from the form manifest.");
            }
            const api = await ensureTurnstile();
            element.replaceChildren();
            const widget = document.createElement("div");
            element.appendChild(widget);
            const widgetId = api.render(widget, {
                sitekey: captcha.siteKey,
                theme: captcha.theme ?? "auto",
                size: captcha.size ?? "normal",
                action: captcha.action ?? undefined,
                language: captcha.locale || undefined,
                callback: (value) => {
                    tokens.set(captcha.name, value);
                },
                "expired-callback": () => {
                    tokens.delete(captcha.name);
                },
                "error-callback": () => {
                    tokens.delete(captcha.name);
                },
            });
            instances.set(captcha.name, { widgetId, element, captcha });
            return () => {
                instances.delete(captcha.name);
                tokens.delete(captcha.name);
                element.replaceChildren();
            };
        },
        async beforeSubmit({ manifest, intent }) {
            if (intent === "back") {
                return;
            }
            const captchas = getCaptchas(manifest.security.captchas);
            if (captchas.length === 0) {
                return;
            }
            const api = await ensureTurnstile();
            for (const captcha of captchas) {
                const instance = instances.get(captcha.name);
                if (!instance) {
                    continue;
                }
                const existing = tokens.get(captcha.name) ||
                    api.getResponse?.(instance.widgetId) ||
                    instance.element.querySelector('[name="cf-turnstile-response"]')?.value;
                if (existing) {
                    tokens.set(captcha.name, existing);
                    continue;
                }
                const value = await waitForValue(() => api.getResponse?.(instance.widgetId) ||
                    instance.element.querySelector('[name="cf-turnstile-response"]')?.value);
                tokens.set(captcha.name, value);
            }
        },
        async buildPayload({ setCaptchaToken, manifest }) {
            for (const captcha of getCaptchas(manifest.security.captchas)) {
                const value = tokens.get(captcha.name);
                if (value) {
                    setCaptchaToken(captcha.name, value);
                }
            }
        },
        async afterSubmit({ response }) {
            if (response.success || response.status === "validation_failed") {
                tokens.clear();
                for (const instance of instances.values()) {
                    window.turnstile?.reset(instance.widgetId);
                }
            }
        },
        async destroy() {
            instances.clear();
            tokens.clear();
        },
    };
}
export const turnstileExtension = createTurnstileExtension();
