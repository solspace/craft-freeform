import type { PropertyValueCollection } from "@ff-client/types/fields";
import {
  hasDesignOverride,
  inheritedDesignSettings,
  themeDesignHandles,
} from "@ff-client/utils/component-design-settings";
import { cardAppearance, sectionAppearance } from "./appearance";

const safeColor = (value: unknown, fallback: string): string => {
  const color = String(value ?? "");
  return /^#(?:[a-f0-9]{3}|[a-f0-9]{6})$/i.test(color) ? color : fallback;
};

export const componentDesignTreatment = (
  properties: PropertyValueCollection,
): "bold" | "soft" =>
  properties.designStyle === "form" && properties.designTreatment === "bold"
    ? "bold"
    : "soft";

export const componentDesignAppearance = (
  properties: PropertyValueCollection,
  formDesign: Record<string, unknown> = {},
  imageUrl?: string,
): Record<string, string> => {
  if (!["form", "custom"].includes(String(properties.designStyle))) return {};

  const settings = inheritedDesignSettings(formDesign);
  for (const handle of themeDesignHandles)
    if (hasDesignOverride(properties, handle))
      settings[handle] = properties[handle];
  const accent = safeColor(settings.designAccentColor, "#6d28d9");
  const accentText = safeColor(settings.designAccentTextColor, "#ffffff");
  const surface = safeColor(settings.designSurfaceColor, "#f5f3ff");
  const text = safeColor(settings.designTextColor, "#2e1065");
  const spacing = String(settings.designSpacing);
  const corners = String(settings.designCorners);
  const [padding, gap, cardPadding] = (
    {
      compact: [16, 12, 12],
      comfortable: [32, 20, 24],
      spacious: [56, 32, 36],
    } as Record<string, number[]>
  )[spacing] ?? [32, 20, 24];
  const radius =
    ({ square: 0, soft: 12, rounded: 24 } as Record<string, number>)[corners] ??
    12;
  const bold = componentDesignTreatment(properties) === "bold";

  const styles = {
    "--freeform-accent-color": accent,
    "--freeform-accent-text-color": accentText,
    "--freeform-button-accent-color": bold ? accentText : accent,
    "--freeform-button-accent-text-color": bold ? accent : accentText,
    "--freeform-background-color": bold ? accent : surface,
    "--freeform-text-color": bold ? accentText : text,
    "--freeform-component-body-color": text,
    "--freeform-padding": `${padding}px`,
    "--freeform-component-gap": `${gap}px`,
    "--freeform-component-card-padding": `${cardPadding}px`,
    "--freeform-component-radius": `${radius}px`,
    "--freeform-component-card-radius": `${radius}px`,
    "--freeform-min-height": "0px",
    "--freeform-background-image": "none",
  };
  if (hasDesignOverride(properties, "background")) {
    const individual = sectionAppearance(properties, imageUrl);
    styles["--freeform-background-color"] =
      individual["--freeform-background-color"] ?? "transparent";
    styles["--freeform-background-image"] =
      individual["--freeform-background-image"] ?? "none";
  }
  if (hasDesignOverride(properties, "textColor"))
    styles["--freeform-text-color"] = safeColor(
      properties.textColor,
      "#334155",
    );
  if (hasDesignOverride(properties, "sectionRadiusPreset"))
    styles["--freeform-component-radius"] =
      `${({ square: 0, three: 3, five: 5, ten: 10, fifteen: 15, twenty: 20 } as Record<string, number>)[String(properties.sectionRadiusPreset)] ?? Math.max(0, Math.min(64, Number(properties.sectionRadius) || 0))}px`;
  if (hasDesignOverride(properties, "padding"))
    styles["--freeform-padding"] =
      `${({ none: 0, small: 24, medium: 40, large: 64 } as Record<string, number>)[String(properties.padding)] ?? (properties.padding === "custom" ? Math.max(0, Math.min(200, Number(properties.customPadding) || 0)) : 40)}px`;
  if (hasDesignOverride(properties, "minHeight"))
    styles["--freeform-min-height"] =
      `${Math.max(0, Math.min(1000, Number(properties.minHeight) || 0))}px`;
  if (hasDesignOverride(properties, "gap"))
    styles["--freeform-component-gap"] =
      `${({ small: 8, medium: 16, large: 32 } as Record<string, number>)[String(properties.gap)] ?? (properties.gap === "custom" ? Math.max(0, Math.min(200, Number(properties.customGap) || 0)) : 16)}px`;
  return styles;
};

export const designedCardAppearance = (
  properties: PropertyValueCollection,
  design: Record<string, string>,
): Record<string, string> => {
  if (properties.columnStyle !== "cards" || !Object.keys(design).length)
    return {};
  const styles = {
    "--freeform-card-background": "#ffffff",
    "--freeform-card-color": design["--freeform-component-body-color"],
    "--freeform-card-border-color": `color-mix(in srgb, ${design["--freeform-accent-color"]} 20%, #ffffff)`,
    "--freeform-card-border-width": "1px",
    "--freeform-card-radius": design["--freeform-component-card-radius"],
    "--freeform-card-padding": design["--freeform-component-card-padding"],
  };
  const individual = cardAppearance(properties);
  for (const [handle, variable] of Object.entries({
    cardBackgroundColor: "--freeform-card-background",
    cardTextColor: "--freeform-card-color",
    cardBorderColor: "--freeform-card-border-color",
    cardBorderWidthPreset: "--freeform-card-border-width",
    cardRadiusPreset: "--freeform-card-radius",
    cardPadding: "--freeform-card-padding",
  }))
    if (hasDesignOverride(properties, handle))
      styles[variable as keyof typeof styles] = individual[variable];
  return styles;
};
