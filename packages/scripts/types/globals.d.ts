/** biome-ignore-all lint/correctness/noUnusedVariables: there is no other way */
/** biome-ignore-all lint/suspicious/noExplicitAny: we don't have a better type */

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
