import type { PropertyValueCollection } from "@ff-client/types/fields";

export const iconAccessibleName = (value: unknown): string => {
  const name = String(value ?? "");
  if (!/^[a-z0-9-]{1,100}$/.test(name)) return "";
  const words = name.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
};

/** Defaults for newly inserted icons only; loading and duplication preserve saved values. */
export const initializeIconProperties = (
  properties: PropertyValueCollection,
): void => {
  if (!properties.accessibleText)
    properties.accessibleText = iconAccessibleName(properties.icon);
  if (
    (!properties.iconSizePreset || properties.iconSizePreset === "custom") &&
    (!properties.iconSize || Number(properties.iconSize) === 48)
  )
    properties.iconSizePreset = "medium";
};

export const initializeDividerProperties = (
  properties: PropertyValueCollection,
): void => {
  if (
    (!properties.thicknessPreset || properties.thicknessPreset === "custom") &&
    (!properties.thickness || Number(properties.thickness) === 1)
  )
    properties.thicknessPreset = "one";
};

/** Keep the first card radius presets visually unchanged after the preset choices change. */
export const normalizeLegacyCardRadius = (
  properties: PropertyValueCollection,
): PropertyValueCollection => {
  const radius = (
    { square: 0, small: 4, medium: 8, rounded: 12, large: 24 } as Record<
      string,
      number
    >
  )[String(properties.cardRadiusPreset)];
  return radius === undefined
    ? properties
    : { ...properties, cardRadiusPreset: "custom", cardRadius: radius };
};

export const initializeLayoutProperties = (
  properties: PropertyValueCollection,
): void => {
  if (
    (!properties.cardBorderWidthPreset ||
      properties.cardBorderWidthPreset === "custom") &&
    (properties.cardBorderWidth === undefined ||
      Number(properties.cardBorderWidth) === 1)
  )
    properties.cardBorderWidthPreset = "one";
  if (
    (!properties.cardRadiusPreset ||
      properties.cardRadiusPreset === "custom") &&
    (properties.cardRadius === undefined ||
      Number(properties.cardRadius) === 12)
  ) {
    properties.cardRadiusPreset = "five";
    properties.cardRadius = 5;
  }
  if (
    (!properties.overlayOpacityPreset ||
      properties.overlayOpacityPreset === "custom") &&
    (properties.overlayOpacity === undefined ||
      Number(properties.overlayOpacity) === 45)
  ) {
    properties.overlayOpacityPreset = "light";
    properties.overlayOpacity = 10;
  }
};
