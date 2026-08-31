import { FRCWidgetCompleteEventName, FRCWidgetExpireEventName, FriendlyCaptchaSDK, } from "@friendlycaptcha/sdk";
import { PACKAGE_VERSION } from "../version.js";
import { inferCaptchaProvider, waitForValue } from "./shared.js";
const FIELD_NAME = "frc-captcha-response";
function getCaptchas(manifestCaptchas) {
    return (manifestCaptchas ?? []).filter((captcha) => inferCaptchaProvider(captcha) === "friendly-captcha");
}
let sdkSingleton = null;
function getSdk(apiEndpoint) {
    if (!sdkSingleton) {
        sdkSingleton = new FriendlyCaptchaSDK({
            apiEndpoint: apiEndpoint || "global",
        });
    }
    return sdkSingleton;
}
function fieldName(captcha) {
    return captcha.name || FIELD_NAME;
}
function readToken(element, captcha) {
    const name = fieldName(captcha);
    const input = element.querySelector(`input[name="${name}"]`);
    return input?.value || undefined;
}
function destroyInstance(instance) {
    if (!instance) {
        return;
    }
    try {
        if (!instance.handle.isDestroyed) {
            instance.handle.destroy();
        }
    }
    catch {
        /* ignore */
    }
}
export function createFriendlyCaptchaExtension() {
    const instances = new Map();
    const tokens = new Map();
    return {
        name: "captcha.friendly-captcha",
        version: PACKAGE_VERSION,
        async mountCaptcha({ captcha, element }) {
            if (inferCaptchaProvider(captcha) !== "friendly-captcha") {
                return;
            }
            if (!captcha.siteKey) {
                throw new Error("Friendly Captcha site key is missing from the form manifest.");
            }
            const existing = instances.get(captcha.name);
            if (existing &&
                !existing.handle.isDestroyed &&
                existing.element === element &&
                element.contains(existing.mount)) {
                return () => {
                    destroyInstance(instances.get(captcha.name));
                    instances.delete(captcha.name);
                    tokens.delete(captcha.name);
                    element.replaceChildren();
                };
            }
            destroyInstance(existing);
            instances.delete(captcha.name);
            element.replaceChildren();
            const mount = document.createElement("div");
            mount.className = "ff-frc-mount frc-captcha";
            element.appendChild(mount);
            const sdk = getSdk(captcha.apiEndpoint);
            const handle = sdk.createWidget({
                element: mount,
                sitekey: captcha.siteKey,
                formFieldName: fieldName(captcha),
                startMode: captcha.startMode || "focus",
                theme: captcha.theme || "auto",
                apiEndpoint: captcha.apiEndpoint || "global",
                ...(captcha.locale ? { language: captcha.locale } : {}),
            });
            const onComplete = () => {
                const value = readToken(element, captcha);
                if (value) {
                    tokens.set(captcha.name, value);
                }
            };
            const onExpire = () => {
                tokens.delete(captcha.name);
                try {
                    if (!handle.isDestroyed) {
                        handle.reset();
                    }
                }
                catch {
                    /* Widget may be destroyed */
                }
            };
            mount.addEventListener(FRCWidgetCompleteEventName, onComplete);
            mount.addEventListener(FRCWidgetExpireEventName, onExpire);
            instances.set(captcha.name, { element, mount, handle, captcha });
            return () => {
                mount.removeEventListener(FRCWidgetCompleteEventName, onComplete);
                mount.removeEventListener(FRCWidgetExpireEventName, onExpire);
                destroyInstance(instances.get(captcha.name));
                instances.delete(captcha.name);
                tokens.delete(captcha.name);
                if (element.isConnected) {
                    element.replaceChildren();
                }
            };
        },
        async beforeSubmit({ manifest, intent }) {
            if (intent === "back" || intent === "validate") {
                return;
            }
            for (const captcha of getCaptchas(manifest.security.captchas)) {
                const instance = instances.get(captcha.name);
                if (!instance || instance.handle.isDestroyed) {
                    continue;
                }
                const existing = readToken(instance.element, captcha) || tokens.get(captcha.name);
                if (existing) {
                    tokens.set(captcha.name, existing);
                    continue;
                }
                try {
                    instance.handle.start();
                }
                catch {
                    /* Widget may already be solving */
                }
                try {
                    const value = await waitForValue(() => readToken(instance.element, captcha) || tokens.get(captcha.name), 12000);
                    tokens.set(captcha.name, value);
                }
                catch {
                    throw new Error("Friendly Captcha is not ready. Complete the captcha widget, then submit again.");
                }
            }
        },
        async buildPayload({ setCaptchaToken, manifest }) {
            for (const captcha of getCaptchas(manifest.security.captchas)) {
                const instance = instances.get(captcha.name);
                const value = tokens.get(captcha.name) ||
                    (instance ? readToken(instance.element, captcha) : undefined);
                if (value) {
                    setCaptchaToken(captcha.name, value);
                }
            }
        },
        async afterSubmit() {
            for (const instance of instances.values()) {
                try {
                    if (!instance.handle.isDestroyed) {
                        instance.handle.reset();
                    }
                }
                catch {
                    /* ignore */
                }
            }
            tokens.clear();
        },
        async destroy() {
            for (const [name, instance] of instances) {
                destroyInstance(instance);
                instances.delete(name);
            }
            tokens.clear();
        },
    };
}
export const friendlyCaptchaExtension = createFriendlyCaptchaExtension();
