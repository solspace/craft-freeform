const selector = "img[data-freeform-signature-preview]";
const inlineImage = /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+={0,2}$/;

export function signatureDownloadFilename(
  element: Element,
  type: "png" | "jpg",
) {
  const name = element.closest<HTMLElement>("[data-signature-filename]")
    ?.dataset.signatureFilename;
  const basename =
    name && /^signature-[1-9]\d*-[1-9]\d*$/.test(name) ? name : "signature";
  return `${basename}.${type}`;
}

export function hasOpaqueSignatureBackground(pixels: ImageData) {
  const { data, width, height } = pixels;
  return [
    0,
    (width - 1) * 4,
    (height - 1) * width * 4,
    (width * height - 1) * 4,
  ].every((offset) => data[offset + 3] >= 250);
}

/** Change display ink only; never remove a background baked into a legacy image. */
export function blackSignatureInk(pixels: ImageData) {
  if (hasOpaqueSignatureBackground(pixels)) return pixels;
  for (let offset = 0; offset < pixels.data.length; offset += 4) {
    pixels.data[offset] = pixels.data[offset + 1] = pixels.data[offset + 2] = 0;
  }
  return pixels;
}

export function signatureDownload(
  image: HTMLImageElement,
  type: "png" | "jpg",
) {
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return null;
  if (type === "jpg") {
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(image, 0, 0);
  return canvas.toDataURL(type === "jpg" ? "image/jpeg" : "image/png");
}

export function mountSignaturePreviews(root: HTMLElement) {
  const prepared = new WeakSet<HTMLImageElement>();
  const prepare = (image: HTMLImageElement) => {
    if (prepared.has(image)) return;
    prepared.add(image);
    const source = image.getAttribute("src")?.trim() ?? "";
    if (!inlineImage.test(source)) {
      image.hidden = true;
      image.removeAttribute("src");
      return;
    }

    const render = () => {
      if (!image.isConnected || !image.naturalWidth || !image.naturalHeight)
        return;
      const thumbnail = image.dataset.freeformSignaturePreview === "thumbnail";
      const scale = Math.min(
        1,
        (thumbnail ? 160 : 600) / image.naturalWidth,
        (thumbnail ? 40 : 180) / image.naturalHeight,
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) return;
      try {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
        if (hasOpaqueSignatureBackground(pixels)) return;
        context.putImageData(blackSignatureInk(pixels), 0, 0);
        image.src = canvas.toDataURL("image/png");
      } catch {
        // Leave the validated original visible if canvas conversion is unavailable.
      }
    };
    if (image.complete) render();
    else image.addEventListener("load", render, { once: true });

    image
      .closest(".signature-wrapper")
      ?.querySelectorAll<HTMLButtonElement>("[data-signature-download]")
      .forEach((button) => {
        button.addEventListener("click", () => {
          const type =
            button.dataset.signatureDownload === "jpg" ? "jpg" : "png";
          const original = new Image();
          button.disabled = true;
          const finish = () => {
            button.disabled = false;
          };
          original.onload = () => {
            try {
              const url =
                type === "png" && source.startsWith("data:image/png;")
                  ? source
                  : signatureDownload(original, type);
              if (!url) return;
              const link = document.createElement("a");
              link.download = signatureDownloadFilename(button, type);
              link.href = url;
              link.click();
            } finally {
              finish();
            }
          };
          original.onerror = finish;
          original.src = source;
        });
      });
  };
  const scan = (node: HTMLElement) => {
    if (node.matches(selector)) prepare(node as HTMLImageElement);
    node.querySelectorAll<HTMLImageElement>(selector).forEach(prepare);
  };
  scan(root);
  const observer = new MutationObserver((records) => {
    for (const record of records)
      for (const node of record.addedNodes) {
        if (node instanceof HTMLElement) scan(node);
      }
  });
  observer.observe(root, { childList: true, subtree: true });
  return () => observer.disconnect();
}
