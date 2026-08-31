const loadedScripts = new Map();
export function loadScriptOnce(src, id) {
    const existing = loadedScripts.get(id);
    if (existing) {
        return existing.promise;
    }
    const promise = new Promise((resolve, reject) => {
        if (typeof document === "undefined") {
            reject(new Error("Captcha scripts require a browser environment."));
            return;
        }
        const existingNode = document.getElementById(id);
        if (existingNode) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.id = id;
        script.src = src;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load captcha script: ${src}`));
        document.head.appendChild(script);
    });
    loadedScripts.set(id, { promise });
    return promise;
}
export function waitForValue(read, timeoutMs = 8000, intervalMs = 100) {
    return new Promise((resolve, reject) => {
        const started = Date.now();
        const tick = () => {
            const value = read();
            if (value) {
                resolve(value);
                return;
            }
            if (Date.now() - started >= timeoutMs) {
                reject(new Error("Timed out waiting for captcha token."));
                return;
            }
            window.setTimeout(tick, intervalMs);
        };
        tick();
    });
}
export function inferCaptchaProvider(captcha) {
    if (captcha.provider) {
        return captcha.provider;
    }
    switch (captcha.name) {
        case "cf-turnstile-response":
            return "turnstile";
        case "g-recaptcha-response":
            return "recaptcha";
        case "h-captcha-response":
            return "hcaptcha";
        case "frc-captcha-response":
            return "friendly-captcha";
        default:
            return null;
    }
}
