const escapeXml = (text: string): string =>
  text.replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char]!,
  );

/** A small, stable schematic of the section currently visible in the builder. */
export const createSectionPreview = (
  label: string,
  element: HTMLElement,
): string => {
  const bounds = element.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return "";
  const width = 280;
  const bodyHeight = Math.max(
    80,
    Math.min(144, (bounds.height * 260) / bounds.width),
  );
  const height = bodyHeight + 40;
  const sx = 260 / bounds.width,
    sy = bodyHeight / bounds.height;
  const rectangle = (node: Element, fill: string, stroke: string): string => {
    const rect = node.getBoundingClientRect();
    return `<rect x="${10 + (rect.left - bounds.left) * sx}" y="${30 + (rect.top - bounds.top) * sy}" width="${Math.max(1, rect.width * sx)}" height="${Math.max(2, rect.height * sy)}" rx="2" fill="${fill}" stroke="${stroke}"/>`;
  };
  const columns = Array.from(element.querySelectorAll("[data-layout-column]"));
  const frames = columns
    .map((column) => rectangle(column, "#edf2f8", "#b9c8d9"))
    .join("");
  const content = Array.from(element.querySelectorAll("[data-field-type]"))
    .filter(
      (node) =>
        !["layout", "group"].includes(node.getAttribute("data-field-type")),
    )
    .map((node) => {
      const rect = node.getBoundingClientRect();
      const x = 14 + (rect.left - bounds.left) * sx,
        y = 34 + (rect.top - bounds.top) * sy;
      const w = Math.max(8, rect.width * sx - 10);
      const type = node.getAttribute("data-field-type");
      if (type === "image")
        return `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(8, rect.height * sy - 8)}" rx="2" fill="#a7bdd2"/>`;
      return `<rect x="${x}" y="${y}" width="${w * (type === "heading" ? 0.7 : 0.9)}" height="${type === "heading" ? 5 : 3}" rx="1.5" fill="${type === "heading" ? "#647d99" : "#aabed1"}"/>${type === "rich-text" ? `<rect x="${x}" y="${y + 6}" width="${w * 0.65}" height="3" rx="1.5" fill="#aabed1"/>` : ""}`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect x=".5" y=".5" width="279" height="${height - 1}" rx="6" fill="#fff" stroke="#8aa2b8"/><text x="12" y="20" fill="#3f4d5a" font-family="system-ui,sans-serif" font-size="12" font-weight="600">${escapeXml((label || "Section").slice(0, 32))}</text>${frames || `<rect x="10" y="30" width="260" height="${bodyHeight}" rx="3" fill="#edf2f8" stroke="#b9c8d9"/>`}${content}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const createPreview = (label: string, element?: HTMLElement): string => {
  if (element) return createSectionPreview(label, element);
  let [width, height] = [200, 40];

  const canvas = document.createElement("canvas");
  if (!canvas.getContext) {
    return null;
  }

  const ctx = canvas.getContext("2d");

  const devicePixelRatio = window.devicePixelRatio || 1;
  const backingStoreRatio = 1;

  const ratio = devicePixelRatio / backingStoreRatio;

  width = width * ratio;
  height = height * ratio;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);

  const lineDashWidth = Math.ceil(4 * ratio);
  const lineDashSpacing = Math.ceil(2 * ratio);

  ctx.setLineDash([lineDashWidth, lineDashSpacing]);
  ctx.strokeStyle = "#c9c9c9";
  ctx.lineDashOffset = 0;
  ctx.lineWidth = 4 * ratio;
  ctx.strokeRect(0, 0, width, height);

  const fontSize = Math.ceil(14 * ratio);

  ctx.font = `normal ${fontSize}px system-ui,BlinkMacSystemFont,-apple-system,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif`;
  ctx.fillStyle = "#3f4d5a";
  ctx.fillText(label, Math.ceil(10 * ratio), Math.ceil(25 * ratio));

  return canvas.toDataURL();
};
