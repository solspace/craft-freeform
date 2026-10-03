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
    constructor(contents: HTMLElement, settings?: { autoOpen?: boolean });
    on(event: "close", callback: () => void): void;
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
