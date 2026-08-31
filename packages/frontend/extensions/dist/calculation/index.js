import { PACKAGE_VERSION } from "../version.js";
function supportsCalculation(field) {
    return (field.type === "calculation" ||
        field.frontend?.extension === "calculation" ||
        field.frontend?.renderer === "calculation");
}
/**
 * Registers the calculation extension required by manifests that include
 * calculation fields. Live evaluation is handled by @solspace/freeform-react
 * (and evaluateCalculation from @solspace/freeform-core).
 */
export function createCalculationExtension() {
    return {
        name: "calculation",
        version: PACKAGE_VERSION,
        supports: supportsCalculation,
    };
}
export const calculationExtension = createCalculationExtension();
