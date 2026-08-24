export function joinClassNames(...parts) {
    const value = parts
        .filter((part) => typeof part === "string" && part.trim() !== "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    return value || undefined;
}
export function mergeClassNames(strategy, base, extra) {
    if (!extra) {
        return base;
    }
    if (!base || strategy === "replace") {
        return extra;
    }
    return `${base} ${extra}`.trim();
}
