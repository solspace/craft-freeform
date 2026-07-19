export function mergeClassNames(strategy, base, extra) {
    if (!extra) {
        return base;
    }
    if (!base || strategy === "replace") {
        return extra;
    }
    return `${base} ${extra}`.trim();
}
