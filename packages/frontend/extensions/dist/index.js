export { calculationExtension, createCalculationExtension, } from "./calculation/index.js";
export * from "./captchas/index.js";
export { createDatetimeExtension, datetimeExtension, } from "./datetime/index.js";
export { createFileDndExtension, fileDndExtension, } from "./file-dnd/index.js";
export { createMolliePaymentExtension, MolliePaymentRedirectError, molliePaymentExtension, } from "./payments/mollie/index.js";
export { createPayPalPaymentExtension, paypalPaymentExtension, } from "./payments/paypal/index.js";
export { createSquarePaymentExtension, squarePaymentExtension, } from "./payments/square/index.js";
export { createStripePaymentExtension, stripePaymentExtension, } from "./payments/stripe/index.js";
export { createSignatureExtension, signatureExtension, supportsSignature, } from "./signature/index.js";
export { createTableExtension, supportsTable, tableExtension, } from "./table/index.js";
import { calculationExtension } from "./calculation/index.js";
import { captchaExtensions } from "./captchas/index.js";
import { datetimeExtension } from "./datetime/index.js";
import { fileDndExtension } from "./file-dnd/index.js";
import { molliePaymentExtension } from "./payments/mollie/index.js";
import { paypalPaymentExtension } from "./payments/paypal/index.js";
import { squarePaymentExtension } from "./payments/square/index.js";
import { stripePaymentExtension } from "./payments/stripe/index.js";
import { signatureExtension } from "./signature/index.js";
import { tableExtension } from "./table/index.js";
export { captchaExtensions };
export const recommendedExtensions = [
    ...captchaExtensions,
    calculationExtension,
    datetimeExtension,
    fileDndExtension,
    tableExtension,
    signatureExtension,
    stripePaymentExtension,
    squarePaymentExtension,
    paypalPaymentExtension,
    molliePaymentExtension,
];
export default captchaExtensions;
