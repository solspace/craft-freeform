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
    if (!/^GTM-[A-Z0-9]+$/i.test(id) || this.containerIds.has(id)) {
      return;
    }
    this.containerIds.add(id);
    const existing = Array.from(document.scripts).some((script) => {
      try {
        const url = new URL(script.src, window.location.href);
        return (
          url.hostname === "www.googletagmanager.com" &&
          url.pathname === "/gtm.js" &&
          url.searchParams.get("id") === id
        );
      } catch {
        return false;
      }
    });
    const containers = (
      window as Window & {
        google_tag_manager?: Record<string, unknown>;
      }
    ).google_tag_manager;
    if (existing || containers?.[id]) {
      return;
    }

    this.dataLayer.push({
      "gtm.start": Date.now(),
      event: "gtm.js",
      "gtm.container": id,
    });

    this.loadScript(id);
  }

  private loadScript(id: string): void {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.head.appendChild(script);
    }
  }

  public observeNewForms(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const forms =
            node instanceof HTMLFormElement
              ? [node]
              : node.querySelectorAll<HTMLFormElement>("form[data-gtm-id]");
          for (const form of forms) {
            const id = form.dataset.gtmId;
            if (id) this.loadContainer(id);
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
