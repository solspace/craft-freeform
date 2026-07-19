/**
 * Convert Freeform handles / type tokens to BEM modifier segments.
 * Example: firstName → first-name, multiple-select → multiple-select
 */
export function toBemModifier(value) {
    return value
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/[_\s]+/g, "-")
        .replace(/-+/g, "-")
        .toLowerCase();
}
