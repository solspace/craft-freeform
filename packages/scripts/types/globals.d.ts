/* eslint-disable @typescript-eslint/no-explicit-any */

interface Window {
  hcaptcha: any;
}

declare let hcaptcha: any;

declare const Craft: {
  csrfTokenName: string;
  csrfTokenValue: string;
  getCpUrl: (url: string) => string;
  asciiString: (value: string) => string;
  filterArray: <T>(array: T[]) => T[];
};

interface CraftGlobal {
  Craft: {
    csrfTokenName: string;
    csrfTokenValue: string;
  };
}
