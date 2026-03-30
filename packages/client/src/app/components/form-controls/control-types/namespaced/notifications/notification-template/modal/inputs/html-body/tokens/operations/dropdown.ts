import type { TokenAPI } from "../tokens.dropdown";
import { renderTokenDropdown } from "../tokens.dropdown";
import type { TokenBackend } from "../tokens.types";

let api: TokenAPI;

export const show = (backend: TokenBackend): void => {
  hide();
  api = renderTokenDropdown(backend);
};

export const hide = (): void => {
  if (api) {
    api.close();
    api = undefined;
  }
};
