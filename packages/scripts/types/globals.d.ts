/* eslint-disable @typescript-eslint/no-explicit-any */

interface Window {
  hcaptcha: any;
}

declare let hcaptcha: any;

declare const Craft: {
  csrfTokenName: string;
  csrfTokenValue: string;
  getCpUrl: (url: string) => string;
};

interface CraftGlobal {
  Craft: {
    csrfTokenName: string;
    csrfTokenValue: string;
  };
}
