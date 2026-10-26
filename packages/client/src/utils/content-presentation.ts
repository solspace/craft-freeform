export const contentVideoStyles = (data: Record<string, unknown>): string => {
  const maximumWidth = Math.max(
    0,
    Math.min(4000, Number(data.maximumWidth) || 0),
  );
  const ratio =
    (
      {
        landscape: "16 / 9",
        photo: "4 / 3",
        square: "1 / 1",
        portrait: "9 / 16",
      } as Record<string, string>
    )[String(data.aspectRatio)] ?? "16 / 9";
  const left = ["center", "right"].includes(String(data.alignment))
    ? "auto"
    : "0";
  const right = data.alignment === "right" ? "0" : "auto";
  return `width:100%;max-width:${maximumWidth ? `${maximumWidth}px` : "100%"};margin-left:${left};margin-right:${right};aspect-ratio:${ratio};box-sizing:border-box;`;
};

export const contentIconMarkup = (
  svg: string | undefined,
  data: Record<string, unknown>,
): string => {
  if (!svg) return "";
  const document = new DOMParser().parseFromString(svg, "image/svg+xml");
  const root = document.documentElement;
  if (root.localName !== "svg" || document.querySelector("parsererror"))
    return "";
  const size =
    ({ small: 24, medium: 48, large: 64 } as Record<string, number>)[
      String(data.iconSizePreset)
    ] ?? Math.max(8, Math.min(256, Number(data.iconSize) || 48));
  const color = /^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(String(data.color))
    ? String(data.color)
    : "#64748b";
  root.setAttribute("width", String(size));
  root.setAttribute("height", String(size));
  root.setAttribute("fill", "currentColor");
  root.setAttribute(
    "style",
    `display:block;max-width:100%;height:auto;color:${color}`,
  );
  root.setAttribute("focusable", "false");
  root.removeAttribute("aria-labelledby");
  if (data.accessibleText) {
    root.setAttribute("role", "img");
    root.setAttribute("aria-label", String(data.accessibleText));
    root.removeAttribute("aria-hidden");
  } else {
    root.setAttribute("aria-hidden", "true");
    root.removeAttribute("role");
    root.removeAttribute("aria-label");
  }
  return root.outerHTML;
};

const unsafeUrlCharacters = (value: string): boolean =>
  Array.from(value).some(
    (char) =>
      char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || char === "\\",
  );

export const safeContentUrl = (value: unknown): string => {
  const url = String(value ?? "").trim();
  if (!url || unsafeUrlCharacters(url) || url.startsWith("//")) return "#";
  const scheme = url.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();
  if (scheme) {
    if (
      !["http", "https", "mailto", "tel"].includes(scheme) ||
      url.length <= scheme.length + 1
    )
      return "#";
    if (["http", "https"].includes(scheme)) {
      // Match the server's explicit scheme + host requirement.
      if (!/^https?:\/\/[^/?#]+/i.test(url)) return "#";
      try {
        if (!new URL(url).hostname) return "#";
      } catch {
        return "#";
      }
    }
  }
  return url;
};

export const contentVideoUrl = (value: unknown): string | undefined => {
  const input = String(value ?? "").trim();
  if (unsafeUrlCharacters(input)) return;
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password || url.port)
      return;
    const host = url.hostname.toLowerCase();
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    if (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtube-nocookie.com",
        "www.youtube-nocookie.com",
        "youtu.be",
        "www.youtu.be",
      ].includes(host)
    ) {
      const id = ["youtu.be", "www.youtu.be"].includes(host)
        ? path
        : path === "watch"
          ? url.searchParams.get("v")
          : path.match(/^(?:embed|shorts|live)\/([^/]+)$/)?.[1];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id)
        ? `https://www.youtube-nocookie.com/embed/${id}`
        : undefined;
    }
    const match = path.match(/^(?:video\/)?([0-9]+)(?:\/([a-zA-Z0-9]+))?$/);
    if (
      ["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(host) &&
      match
    ) {
      const hash = url.searchParams.get("h") ?? match[2] ?? "";
      return `https://player.vimeo.com/video/${match[1]}${/^[a-zA-Z0-9]+$/.test(hash) ? `?h=${hash}` : ""}`;
    }
  } catch {
    return;
  }
};

export const buttonLinkPresentation = (data: Record<string, unknown>) => {
  const safeColor = (value: unknown, fallback: string) =>
    /^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(String(value))
      ? String(value)
      : fallback;
  const localColor = safeColor(data.color, "#1d4ed8");
  const localTextColor = safeColor(data.textColor, "#ffffff");
  const color = data.useComponentAccent
    ? `var(--freeform-button-accent-color, ${localColor})`
    : localColor;
  const textColor = data.useComponentAccent
    ? `var(--freeform-button-accent-text-color, ${localTextColor})`
    : localTextColor;
  const appearance = ["filled", "outline", "link"].includes(
    String(data.appearance),
  )
    ? String(data.appearance)
    : "filled";
  const [padding, fontSize] = (
    {
      small: ["8px 16px", 14],
      medium: ["12px 24px", 16],
      large: ["16px 32px", 18],
    } as Record<string, [string, number]>
  )[String(data.size)] ?? ["12px 24px", 16];
  return {
    safeLink: safeContentUrl(data.url),
    linkAlignment: ["left", "center", "right"].includes(String(data.alignment))
      ? String(data.alignment)
      : "left",
    buttonStyles: `display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;max-width:100%;overflow-wrap:anywhere;white-space:normal;line-height:1.3;font-weight:600;border-radius:${data.useComponentAccent ? "var(--freeform-component-radius, 6px)" : "6px"};font-size:${fontSize}px;padding:${appearance === "link" ? "0" : padding};border:1px solid ${appearance === "link" ? "transparent" : color};background:${appearance === "filled" ? color : "transparent"};color:${appearance === "filled" ? textColor : color};text-decoration:${appearance === "link" ? "underline" : "none"}`,
  };
};
