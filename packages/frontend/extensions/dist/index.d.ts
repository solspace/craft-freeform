export { calculationExtension, createCalculationExtension, } from "./calculation/index.js";
export * from "./captchas/index.js";
export { createDatetimeExtension, datetimeExtension, } from "./datetime/index.js";
export { createFileDndExtension, fileDndExtension, } from "./file-dnd/index.js";
export { createTableExtension, supportsTable, tableExtension, } from "./table/index.js";
import type { FreeformExtension } from "@solspace/freeform-core";
import { captchaExtensions } from "./captchas/index.js";
export { captchaExtensions };
export declare const recommendedExtensions: FreeformExtension[];
export default captchaExtensions;
//# sourceMappingURL=index.d.ts.map