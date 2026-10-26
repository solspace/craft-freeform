import type { PropertyValueCollection } from "@ff-client/types/fields";

export const designDefaults = {
  designAccentColor: "#6d28d9",
  designAccentTextColor: "#ffffff",
  designSurfaceColor: "#f5f3ff",
  designTextColor: "#2e1065",
  designSpacing: "comfortable",
  designCorners: "soft",
};
export const themeDesignHandles = Object.keys(designDefaults);
export const sectionDesignHandles = [
  "background",
  "backgroundColor",
  "backgroundImage",
  "overlayColor",
  "overlayOpacityPreset",
  "overlayOpacity",
  "padding",
  "minHeight",
  "textColor",
  "sectionRadiusPreset",
  "sectionRadius",
  "customPadding",
];
export const cardDesignHandles = [
  "cardBackgroundColor",
  "cardTextColor",
  "cardBorderColor",
  "cardBorderWidthPreset",
  "cardBorderWidth",
  "cardRadiusPreset",
  "cardRadius",
  "cardPadding",
  "customCardPadding",
];
export const appearanceDesignHandles = [
  ...sectionDesignHandles,
  ...cardDesignHandles,
  "customGap",
];
export const designOverrideGroup = (handle: string): string => {
  if (
    [
      "backgroundColor",
      "backgroundImage",
      "overlayColor",
      "overlayOpacityPreset",
      "overlayOpacity",
    ].includes(handle)
  )
    return "background";
  if (handle === "cardBorderWidth") return "cardBorderWidthPreset";
  if (handle === "cardRadius") return "cardRadiusPreset";
  if (handle === "sectionRadius") return "sectionRadiusPreset";
  if (handle === "customPadding") return "padding";
  if (handle === "customCardPadding") return "cardPadding";
  if (handle === "customGap") return "gap";
  return handle;
};
export const isDesignSetting = (handle: string): boolean =>
  handle === "designStyle" ||
  themeDesignHandles.includes(handle) ||
  appearanceDesignHandles.includes(handle) ||
  handle === "gap";

/** Editor conversion is applied only when design settings are edited, never on load. */
export const editableComponentDesign = (
  properties: PropertyValueCollection,
): PropertyValueCollection => {
  let next: PropertyValueCollection;
  if (["form", "custom"].includes(String(properties.designStyle))) {
    next = {
      ...properties,
      designOverrides: Array.isArray(properties.designOverrides)
        ? [...properties.designOverrides]
        : properties.designStyle === "custom"
          ? [...themeDesignHandles]
          : [],
    };
  } else {
    next = {
      ...properties,
      designStyle: "custom",
      designAccentColor: "#1d4ed8",
      designAccentTextColor: "#ffffff",
      textColor: properties.textColor || "#334155",
      sectionRadiusPreset: "custom",
      sectionRadius: 0,
      ...(properties.background !== "color" && properties.background !== "image"
        ? { padding: "none", minHeight: 0 }
        : {}),
      designOverrides: [
        ...new Set([
          "designAccentColor",
          "designAccentTextColor",
          "gap",
          ...appearanceDesignHandles.map(designOverrideGroup),
        ]),
      ],
    };
  }
  if (next.designStyle !== "custom") return next;
  // Project old local theme presets into concrete controls without changing saved data on load.
  const overrides = new Set(next.designOverrides as string[]);
  const apply = (handle: string, values: PropertyValueCollection) => {
    if (overrides.has(handle)) return;
    Object.assign(next, values);
    overrides.add(handle);
  };
  if (overrides.delete("designSurfaceColor"))
    apply("background", {
      background: "color",
      backgroundColor: next.designSurfaceColor,
    });
  if (overrides.delete("designTextColor")) {
    apply("textColor", { textColor: next.designTextColor });
    apply("cardTextColor", { cardTextColor: next.designTextColor });
  }
  if (overrides.delete("designSpacing")) {
    const [padding, gap, cardPadding] = (
      {
        compact: [16, 12, 12],
        comfortable: [32, 20, 24],
        spacious: [56, 32, 36],
      } as Record<string, number[]>
    )[String(next.designSpacing)] ?? [32, 20, 24];
    apply("padding", { padding: "custom", customPadding: padding });
    apply("gap", { gap: "custom", customGap: gap });
    apply("cardPadding", {
      cardPadding: "custom",
      customCardPadding: cardPadding,
    });
  }
  if (overrides.delete("designCorners")) {
    const radius =
      ({ square: 0, soft: 12, rounded: 24 } as Record<string, number>)[
        String(next.designCorners)
      ] ?? 12;
    apply("sectionRadiusPreset", {
      sectionRadiusPreset: "custom",
      sectionRadius: radius,
    });
    apply("cardRadiusPreset", {
      cardRadiusPreset: "custom",
      cardRadius: radius,
    });
  }
  return { ...next, designOverrides: [...overrides] };
};

export const hasDesignOverride = (
  properties: PropertyValueCollection,
  handle: string,
): boolean =>
  properties.designStyle === "custom" &&
  (Array.isArray(properties.designOverrides)
    ? properties.designOverrides.includes(designOverrideGroup(handle))
    : themeDesignHandles.includes(handle));

export const updateComponentDesign = (
  properties: PropertyValueCollection,
  handle: string,
  value: unknown,
  reset = false,
): PropertyValueCollection => {
  const next = editableComponentDesign(properties);
  if (handle === "designStyle") return { ...next, designStyle: value };
  const group = designOverrideGroup(handle);
  const overrides = new Set<string>(next.designOverrides as string[]);
  if (reset) overrides.delete(group);
  else overrides.add(group);
  return {
    ...next,
    designStyle: "custom",
    [handle]: reset ? next[handle] : value,
    designOverrides: [...overrides],
  };
};

export const inheritedDesignSettings = (
  form: Record<string, unknown> = {},
): PropertyValueCollection =>
  Object.fromEntries(
    Object.entries(designDefaults).map(([key, fallback]) => [
      key,
      form[key.replace(/^design/, "component")] ?? fallback,
    ]),
  );
