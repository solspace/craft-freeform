import { loadHcaptcha } from "../../../../../../../frontend/extensions/src/captchas/hcaptcha-loader";
import {
  getCaptchaContainer,
  readCaptchaConfig,
} from "../../common.script-loader";

const TYPE = "hcaptcha";

export enum Version {
  CHECKBOX = "checkbox",
  INVISIBLE = "invisible",
}

export const loadHCaptcha = (form: HTMLFormElement): Promise<void> => {
  const container = getContainer(form);
  if (!container) {
    return Promise.resolve();
  }

  return loadHcaptcha().then(() => {});
};

export const getContainer = (form: HTMLFormElement) =>
  getCaptchaContainer(TYPE, form);
export const readConfig = (container: HTMLElement) =>
  readCaptchaConfig<Version>(container);
