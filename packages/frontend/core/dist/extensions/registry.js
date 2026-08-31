export function createExtensionRegistry() {
    const extensions = new Map();
    return {
        register(extension) {
            extensions.set(extension.name, extension);
        },
        get(name) {
            return extensions.get(name);
        },
        list() {
            return [...extensions.values()];
        },
        assertRequired(required) {
            for (const descriptor of required) {
                const installed = extensions.get(descriptor.name);
                if (!installed && descriptor.severity === "error") {
                    throw new Error(`Required extension "${descriptor.name}" (${descriptor.package}) is not registered.`);
                }
            }
        },
    };
}
export async function runExtensionSetups(extensions, context) {
    for (const extension of extensions) {
        await extension.setup?.(context);
    }
}
export async function collectExtensionSubmitMeta(extensions, context) {
    const meta = { ...(context.meta ?? {}) };
    const payloadContext = {
        ...context,
        meta,
        setMeta(next) {
            Object.assign(meta, next);
        },
        setCaptchaToken(name, value) {
            const existing = Array.isArray(meta.captchas) ? [...meta.captchas] : [];
            const index = existing.findIndex((entry) => entry.name === name);
            const token = { name, value };
            if (index >= 0) {
                existing[index] = token;
            }
            else {
                existing.push(token);
            }
            meta.captchas = existing;
            meta.captcha = token;
        },
    };
    for (const extension of extensions) {
        await extension.beforeSubmit?.({ ...context, meta });
        await extension.buildPayload?.(payloadContext);
    }
    return meta;
}
export async function runExtensionAfterSubmit(extensions, context) {
    for (const extension of extensions) {
        await extension.afterSubmit?.(context);
    }
}
