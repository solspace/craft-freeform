import events from "../constants/event-types";

const scriptCache = new Map<string, HTMLScriptElement>();
const linkCache = new Map<string, HTMLLinkElement>();

type ScriptCreator = (
  src: string,
  options: {
    cacheKey?: string;
    async?: boolean;
    defer?: boolean;
    onLoad?: (script: HTMLScriptElement) => void;
    parent?: HTMLElement;
  },
) => void;

export const createScript: ScriptCreator = (src, options = {}) => {
  const { cacheKey, async, defer, onLoad, parent } = options;
  const key = cacheKey || src;

  if (!scriptCache.has(key)) {
    const script = document.createElement("script");
    const safeSrc = normalizeUrl(src);
    if (!safeSrc) {
      throw new Error(`Unsafe script URL: ${src}`);
    }

    script.src = safeSrc;
    script.async = async ?? false;
    script.defer = defer ?? false;

    script.addEventListener("load", () => {
      if (onLoad) {
        onLoad(script);
      }

      document.dispatchEvent(
        new CustomEvent(events.scripts.afterLoad, {
          detail: { src, script },
        }),
      );
    });

    document.dispatchEvent(
      new CustomEvent(events.scripts.beforeLoad, {
        detail: { src, script },
      }),
    );

    const parentElement = parent || document.body;
    parentElement.appendChild(script);

    scriptCache.set(key, script);
  }

  return scriptCache.get(key) as HTMLScriptElement;
};

type LinkCreator = (
  href: string,
  options?: {
    cacheKey?: string;
    parent?: HTMLElement;
    onLoad?: (stylesheet: HTMLLinkElement) => void;
  },
) => HTMLLinkElement;

export const createLink: LinkCreator = (href, options = {}) => {
  const { cacheKey, parent, onLoad } = options;
  const key = cacheKey || href;

  if (!linkCache.has(key)) {
    const link = document.createElement("link");

    const safeHref = normalizeUrl(href);
    if (!safeHref) {
      throw new Error(`Unsafe stylesheet URL: ${href}`);
    }

    link.rel = "stylesheet";
    link.href = safeHref;

    link.addEventListener("load", () => {
      if (onLoad) {
        onLoad(link);
      }

      document.dispatchEvent(
        new CustomEvent(events.stylesheets.afterLoad, {
          detail: { href, link },
        }),
      );
    });

    document.dispatchEvent(
      new CustomEvent(events.stylesheets.beforeLoad, {
        detail: { href, link },
      }),
    );

    const parentElement = parent || document.body;
    parentElement.appendChild(link);

    linkCache.set(key, link);
  }

  return linkCache.get(key) as HTMLLinkElement;
};

const normalizeUrl = (raw: string): string => {
  try {
    const url = new URL(raw, window.location.href);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    // Invalid URL
  }

  return "";
};
