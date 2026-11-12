type CraftElement = {
  id: number;
  label: string;
  siteId: number;
  status: string;
  url?: string;
  hasThumb: boolean;
};

declare namespace Craft {
  const cp: {
    runQueue?: () => void;
    displaySuccess: (message: string) => void;
    displayNotice: (message: string) => void;
    displayError: (message: string) => void;
  };
  class Slideout {
    constructor(
      contents: HTMLElement,
      settings?: {
        autoOpen?: boolean;
        closeOnEsc?: boolean;
        containerAttributes?: Record<string, string>;
        triggerElement?: Element;
      },
    );
    container: HTMLElement;
    outerContainer: HTMLElement;
    on(event: "close" | "beforeClose", callback: () => void): void;
    open(): void;
    close(): void;
    destroy(): void;
  }

  function createElementSelectorModal(
    elementType: string,
    settings: {
      multiSelect?: boolean;
      sources?: string | string[];
      criteria?: Record<string, unknown>;
      storageKey?: string;
      onSelect: (elements: Array<CraftElement>) => void;
    },
  ): Promise<void>;

  function getCpUrl(path: string): string;
  function t(category: string, message: string): string;

  const csrfTokenName: string;
  const csrfTokenValue: string;
}
