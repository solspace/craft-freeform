import type { PropertyValueCollection } from "@ff-client/types/fields";

const color = (
  value: unknown,
  fallback: string,
  transparent = false,
): string => {
  const text = String(value ?? "");
  if (transparent && ["transparent", "rgba(0,0,0,0)"].includes(text))
    return "transparent";
  return /^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(text) ? text : fallback;
};
const clamp = (value: unknown, fallback: number, max: number): number => {
  const number = Number(value ?? fallback);
  return Number.isFinite(number)
    ? Math.max(0, Math.min(max, number))
    : fallback;
};

export const cardAppearance = (
  properties: PropertyValueCollection,
): Record<string, string> =>
  properties.columnStyle === "cards"
    ? {
        "--freeform-card-background": color(
          properties.cardBackgroundColor,
          "#ffffff",
        ),
        "--freeform-card-color": color(properties.cardTextColor, "#334155"),
        "--freeform-card-border-color": color(
          properties.cardBorderColor,
          "#dbe3ec",
          true,
        ),
        "--freeform-card-border-width": `${({ none: 0, one: 1, two: 2, three: 3 } as Record<string, number>)[String(properties.cardBorderWidthPreset)] ?? clamp(properties.cardBorderWidth, 1, 8)}px`,
        "--freeform-card-radius": `${({ three: 3, five: 5, ten: 10, fifteen: 15, twenty: 20, square: 0, small: 4, medium: 8, rounded: 12, large: 24 } as Record<string, number>)[String(properties.cardRadiusPreset)] ?? clamp(properties.cardRadius, 12, 64)}px`,
        "--freeform-card-padding": `${{ none: 0, small: 16, medium: 24, large: 32 }[String(properties.cardPadding)] ?? 24}px`,
      }
    : {};

export const sectionAppearance = (
  properties: PropertyValueCollection,
  imageUrl?: string,
): Record<string, string> => {
  if (!["color", "image"].includes(String(properties.background))) return {};
  const padding =
    { none: 0, small: 24, medium: 40, large: 64 }[String(properties.padding)] ??
    40;
  let image = "none";
  if (properties.background === "image" && imageUrl) {
    const overlayColor = color(properties.overlayColor, "#000000", true);
    let hex = overlayColor.slice(1);
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    const rgb = [0, 2, 4].map((offset) =>
      parseInt(hex.slice(offset, offset + 2), 16),
    );
    const opacity =
      (
        { light: 10, quarter: 25, half: 50, strong: 75 } as Record<
          string,
          number
        >
      )[String(properties.overlayOpacityPreset)] ??
      clamp(properties.overlayOpacity, 45, 100);
    const overlay =
      overlayColor === "transparent"
        ? "rgba(0, 0, 0, 0)"
        : `rgba(${rgb.join(", ")}, ${opacity / 100})`;
    const quoted = imageUrl
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/[\n\r\f]/g, (char) => `\\${char.charCodeAt(0).toString(16)} `);
    image = `linear-gradient(${overlay}, ${overlay}), url("${quoted}")`;
  }
  return {
    "--freeform-background-color": color(
      properties.backgroundColor,
      "#f1f5f9",
      true,
    ),
    "--freeform-text-color": color(properties.textColor, "#334155"),
    "--freeform-padding": `${padding}px`,
    "--freeform-min-height": `${clamp(properties.minHeight, 0, 1000)}px`,
    "--freeform-background-image": image,
  };
};
