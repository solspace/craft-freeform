export class GTMManager {
  private static instance: GTMManager;

  // biome-ignore lint/suspicious/noExplicitAny: Allow any for dataLayer as it can contain any type of data
  private dataLayer: any[];
  private containerIds: Set<string> = new Set();

  private constructor() {
    window.dataLayer = window.dataLayer || [];
    this.dataLayer = window.dataLayer;
  }

  public static getInstance(): GTMManager {
    if (!GTMManager.instance) {
      GTMManager.instance = new GTMManager();
    }

    return GTMManager.instance;
  }

  public loadContainer(id: string): void {
    if (this.containerIds.has(id)) {
      return;
    }

    if (this.containerIds.size === 0) {
      this.loadScript(id);
    }

    this.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
      "gtm.container": id,
    });

    this.containerIds.add(id);
  }

  private loadScript(id: string): void {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;

    const firstScript = document.getElementsByTagName("script")[0];
    firstScript.parentNode.insertBefore(script, firstScript);
  }

  public observeNewForms(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLFormElement) {
            const gtmId = node.dataset.gtmId;
            if (gtmId) {
              this.loadContainer(gtmId);
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
}
