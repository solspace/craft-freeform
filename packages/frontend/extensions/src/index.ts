export {
  calculationExtension,
  createCalculationExtension,
} from "./calculation/index.js";
export * from "./captchas/index.js";
export {
  createDatetimeExtension,
  datetimeExtension,
} from "./datetime/index.js";
export {
  createFileDndExtension,
  fileDndExtension,
} from "./file-dnd/index.js";

import type { FreeformExtension } from "@solspace/freeform-core";
import { calculationExtension } from "./calculation/index.js";
import { captchaExtensions } from "./captchas/index.js";
import { datetimeExtension } from "./datetime/index.js";
import { fileDndExtension } from "./file-dnd/index.js";

export { captchaExtensions };

export const recommendedExtensions: FreeformExtension[] = [
  ...captchaExtensions,
  calculationExtension,
  datetimeExtension,
  fileDndExtension,
];

export default captchaExtensions;
