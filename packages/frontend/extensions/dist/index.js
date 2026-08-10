export { calculationExtension, createCalculationExtension, } from "./calculation/index.js";
export * from "./captchas/index.js";
export { createDatetimeExtension, datetimeExtension, } from "./datetime/index.js";
export { createFileDndExtension, fileDndExtension, } from "./file-dnd/index.js";
export { createTableExtension, supportsTable, tableExtension, } from "./table/index.js";
import { calculationExtension } from "./calculation/index.js";
import { captchaExtensions } from "./captchas/index.js";
import { datetimeExtension } from "./datetime/index.js";
import { fileDndExtension } from "./file-dnd/index.js";
import { tableExtension } from "./table/index.js";
export { captchaExtensions };
export const recommendedExtensions = [
    ...captchaExtensions,
    calculationExtension,
    datetimeExtension,
    fileDndExtension,
    tableExtension,
];
export default captchaExtensions;
