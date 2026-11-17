/** Typed signatures use the same transparent PNG format as drawn signatures. */
export function typedSignature(
  text: string,
  width = 400,
  height = 100,
  documentRef = document,
): string {
  const value = text.trim();
  if (!value) return "";
  const canvas = documentRef.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";
  context.fillStyle = "#000000";
  context.font = `${Math.min(48, height * 0.55)}px "Snell Roundhand", "Segoe Script", "Bradley Hand", cursive`;
  context.textBaseline = "middle";
  context.fillText(value, 12, height / 2, Math.max(1, width - 24));
  return canvas.toDataURL("image/png");
}
