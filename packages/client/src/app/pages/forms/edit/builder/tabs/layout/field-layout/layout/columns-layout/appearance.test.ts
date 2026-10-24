import { expect, it } from "vitest";
import { cardAppearance, sectionAppearance } from "./appearance";

it("keeps cards opt-in and constrains their appearance while preserving zero values", () => {
  expect(cardAppearance({})).toEqual({});
  expect(
    cardAppearance({
      columnStyle: "cards",
      cardBackgroundColor: "red; position:fixed",
      cardTextColor: "#fff",
      cardBorderWidth: 0,
      cardRadius: 500,
      cardPadding: "none",
    }),
  ).toMatchObject({
    "--freeform-card-background": "#ffffff",
    "--freeform-card-color": "#fff",
    "--freeform-card-border-width": "0px",
    "--freeform-card-radius": "64px",
    "--freeform-card-padding": "0px",
  });
});

it("keeps existing layouts unstyled until a background is enabled", () => {
  expect(sectionAppearance({ backgroundColor: "#ffffff" })).toEqual({});
  expect(sectionAppearance({ background: "none", minHeight: 320 })).toEqual({});
});
it("applies a section-wide color and preserves zero height and padding", () => {
  expect(
    sectionAppearance({
      background: "color",
      backgroundColor: "#abc",
      textColor: "#ffffff",
      padding: "none",
      minHeight: 0,
    }),
  ).toMatchObject({
    "--freeform-background-color": "#abc",
    "--freeform-text-color": "#ffffff",
    "--freeform-padding": "0px",
    "--freeform-min-height": "0px",
    "--freeform-background-image": "none",
  });
});
it("layers the overlay over a safely quoted image and constrains presentation values", () => {
  const style = sectionAppearance(
    {
      background: "image",
      backgroundColor: "red;position:fixed",
      textColor: "url(evil)",
      overlayColor: "#abc",
      overlayOpacity: 150,
      minHeight: 5000,
    },
    'https://example.test/a"b.png',
  );
  expect(style["--freeform-background-image"]).toBe(
    'linear-gradient(rgba(170, 187, 204, 1), rgba(170, 187, 204, 1)), url("https://example.test/a\\"b.png")',
  );
  expect(style["--freeform-min-height"]).toBe("1000px");
  expect(style["--freeform-background-color"]).toBe("#f1f5f9");
  expect(style["--freeform-text-color"]).toBe("#334155");
  expect(
    sectionAppearance({ background: "image", overlayOpacity: 0 }, "image.png")[
      "--freeform-background-image"
    ],
  ).toContain("rgba(0, 0, 0, 0)");
});

it("uses opacity presets while keeping legacy custom opacity and transparent images", () => {
  for (const [overlayOpacityPreset, alpha] of Object.entries({
    light: 0.1,
    quarter: 0.25,
    half: 0.5,
    strong: 0.75,
    custom: 0.45,
  })) {
    expect(
      sectionAppearance(
        { background: "image", overlayOpacityPreset, overlayOpacity: 45 },
        "image.png",
      )["--freeform-background-image"],
    ).toContain(`rgba(0, 0, 0, ${alpha})`);
  }
  expect(
    sectionAppearance(
      {
        background: "image",
        overlayColor: "transparent",
        overlayOpacityPreset: "strong",
      },
      "image.png",
    )["--freeform-background-image"],
  ).toBe(
    'linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0)), url("image.png")',
  );
});

it("applies card border and radius presets without replacing saved custom dimensions", () => {
  for (const [cardBorderWidthPreset, width] of Object.entries({
    none: 0,
    one: 1,
    two: 2,
    three: 3,
    custom: 5,
    unknown: 5,
  })) {
    expect(
      cardAppearance({
        columnStyle: "cards",
        cardBorderWidthPreset,
        cardBorderWidth: 5,
      })["--freeform-card-border-width"],
    ).toBe(`${width}px`);
  }
  for (const [cardRadiusPreset, radius] of Object.entries({
    three: 3,
    five: 5,
    ten: 10,
    fifteen: 15,
    twenty: 20,
    square: 0,
    small: 4,
    medium: 8,
    rounded: 12,
    large: 24,
    custom: 17,
    unknown: 17,
  })) {
    expect(
      cardAppearance({
        columnStyle: "cards",
        cardRadiusPreset,
        cardRadius: 17,
      })["--freeform-card-radius"],
    ).toBe(`${radius}px`);
  }
  expect(
    cardAppearance({
      columnStyle: "cards",
      cardBorderWidth: 0,
      cardRadius: 17,
    }),
  ).toMatchObject({
    "--freeform-card-border-width": "0px",
    "--freeform-card-radius": "17px",
  });
});

it("supports no card border without losing the saved dimensions or corner shape", () => {
  for (const cardBorderColor of ["transparent", "rgba(0,0,0,0)"]) {
    expect(
      cardAppearance({
        columnStyle: "cards",
        cardBorderColor,
        cardBorderWidthPreset: "three",
        cardRadiusPreset: "five",
      }),
    ).toMatchObject({
      "--freeform-card-border-color": "transparent",
      "--freeform-card-border-width": "3px",
      "--freeform-card-radius": "5px",
    });
  }
});
