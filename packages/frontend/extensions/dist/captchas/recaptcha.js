import { PACKAGE_VERSION } from "../version.js";
import { inferCaptchaProvider, loadScriptOnce, waitForValue, } from "./shared.js";
function getCaptchas(manifestCaptchas) {
    return (manifestCaptchas ?? []).filter((captcha) => inferCaptchaProvider(captcha) === "recaptcha");
}
function resolveVersion(captcha) {
    const version = captcha.version ?? "v2-checkbox";
    if (version === "v3" ||
        version === "v2-invisible" ||
        version === "v2-checkbox") {
        return version;
    }
    return "v2-checkbox";
}
/**
 * v3 must load with `render=<siteKey>`. Checkbox / invisible use `render=explicit`.
 * Loading the wrong variant is a common cause of Google's "Invalid key type".
 */
async function ensureRecaptcha(captcha) {
    const version = resolveVersion(captcha);
    const locale = captcha.locale
        ? `&hl=${encodeURIComponent(captcha.locale)}`
        : "";
    const renderParam = version === "v3" && captcha.siteKey
        ? encodeURIComponent(captcha.siteKey)
        : "explicit";
    // Separate script tags so v2 and v3 don't share a stale load.
    const scriptId = version === "v3"
        ? `ff-recaptcha-script-v3-${captcha.siteKey}`
        : "ff-recaptcha-script-explicit";
    await loadScriptOnce(`https://www.google.com/recaptcha/api.js?render=${renderParam}${locale}`, scriptId);
    await new Promise((resolve) => {
        if (window.grecaptcha?.ready) {
            window.grecaptcha.ready(() => resolve());
            return;
        }
        resolve();
    });
    if (!window.grecaptcha) {
        throw new Error("Google reCAPTCHA failed to initialize.");
    }
    return window.grecaptcha;
}
export function createRecaptchaExtension() {
    const instances = new Map();
    const tokens = new Map();
    return {
        name: "captcha.recaptcha",
        version: PACKAGE_VERSION,
        async mountCaptcha({ captcha, element }) {
            if (inferCaptchaProvider(captcha) !== "recaptcha") {
                return;
            }
            if (!captcha.siteKey) {
                throw new Error("reCAPTCHA site key is missing from the form manifest.");
            }
            const version = resolveVersion(captcha);
            element.replaceChildren();
            element.dataset.ffCaptchaVersion = version;
            element.dataset.ffCaptchaSitekey = captcha.siteKey;
            element.dataset.ffCaptchaAction = captcha.action || "submit";
            // Score-based v3 has no visible widget — token is fetched on submit.
            if (version === "v3") {
                await ensureRecaptcha(captcha);
                instances.set(captcha.name, { element, captcha, version });
                return () => {
                    instances.delete(captcha.name);
                    tokens.delete(captcha.name);
                    element.replaceChildren();
                };
            }
            const api = await ensureRecaptcha(captcha);
            const widget = document.createElement("div");
            widget.className = "g-recaptcha";
            element.appendChild(widget);
            const widgetId = api.render(widget, {
                sitekey: captcha.siteKey,
                theme: captcha.theme ?? "light",
                size: version === "v2-invisible" ? "invisible" : (captcha.size ?? "normal"),
                callback: (value) => {
                    tokens.set(captcha.name, value);
                },
                "expired-callback": () => {
                    tokens.delete(captcha.name);
                },
            });
            instances.set(captcha.name, { widgetId, element, captcha, version });
            return () => {
                instances.delete(captcha.name);
                tokens.delete(captcha.name);
                element.replaceChildren();
            };
        },
        async beforeSubmit({ manifest, intent }) {
            if (intent === "back" || intent === "validate") {
                return;
            }
            for (const captcha of getCaptchas(manifest.security.captchas)) {
                const version = resolveVersion(captcha);
                const api = await ensureRecaptcha(captcha);
                const instance = instances.get(captcha.name);
                if (version === "v3") {
                    if (!captcha.siteKey) {
                        throw new Error("reCAPTCHA site key is missing from the form manifest.");
                    }
                    const result = await new Promise((resolve, reject) => {
                        api.ready(async () => {
                            try {
                                const token = await api.execute(captcha.siteKey, {
                                    action: captcha.action || "submit",
                                });
                                resolve(typeof token === "string" ? token : "");
                            }
                            catch (error) {
                                reject(error);
                            }
                        });
                    });
                    if (!result) {
                        throw new Error("reCAPTCHA v3 did not return a token. Check that the Freeform integration version matches the Google key type (Score Based / v3).");
                    }
                    tokens.set(captcha.name, result);
                    continue;
                }
                if (!instance || instance.widgetId === undefined) {
                    continue;
                }
                if (version === "v2-invisible") {
                    await new Promise((resolve, reject) => {
                        try {
                            api.execute(instance.widgetId);
                            void waitForValue(() => api.getResponse(instance.widgetId)).then((value) => {
                                tokens.set(captcha.name, value);
                                resolve();
                            }, reject);
                        }
                        catch (error) {
                            reject(error);
                        }
                    });
                    continue;
                }
                const value = tokens.get(captcha.name) ||
                    api.getResponse(instance.widgetId) ||
                    (await waitForValue(() => api.getResponse(instance.widgetId)));
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
        async afterSubmit() {
            tokens.clear();
            for (const instance of instances.values()) {
                if (instance.widgetId !== undefined) {
                    window.grecaptcha?.reset(instance.widgetId);
                }
            }
        },
        async destroy() {
            instances.clear();
            tokens.clear();
        },
    };
}
export const recaptchaExtension = createRecaptchaExtension();
