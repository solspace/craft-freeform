type CraftElement = {
  id: number;
  label: string;
  siteId: number;
  status: string;
  url?: string;
  hasThumb: boolean;
};

declare namespace Craft {
  class Slideout {
    constructor(
      contents: HTMLElement,
      settings?: {
        autoOpen?: boolean;
        containerAttributes?: Record<string, string>;
        triggerElement?: Element;
      },
    );
    $container: { 0: HTMLElement };
    $outerContainer: { 0: HTMLElement };
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

  const csrfTokenName: string;
  const csrfTokenValue: string;
}
