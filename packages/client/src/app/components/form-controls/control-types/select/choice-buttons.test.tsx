import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { ChoiceButtons, choiceButtonKind } from "./choice-buttons";

vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
it("recognizes horizontal/vertical alignment and heading levels without changing ordinary dropdowns", () => {
  expect(
    choiceButtonKind("alignment", [{ value: "justify", label: "Justify" }]),
  ).toBe("alignment");
  expect(
    choiceButtonKind("verticalAlignment", [
      { value: "middle", label: "Middle" },
    ]),
  ).toBe("alignment");
  expect(choiceButtonKind("level", [{ value: "h6", label: "H6" }])).toBe(
    "heading",
  );
  expect(
    choiceButtonKind("size", [{ value: "small", label: "Small" }]),
  ).toBeUndefined();
  const sizes = ["small", "medium", "large"].map((value) => ({
    value,
    label: value,
  }));
  for (const handle of ["size", "spacing", "gap", "padding", "cardPadding"]) {
    expect(choiceButtonKind(handle, sizes)).toBe("size");
  }
  expect(
    choiceButtonKind("spacing", [
      ...sizes,
      { value: "custom", label: "Custom" },
    ]),
  ).toBe("size");
  expect(
    choiceButtonKind("textSize", [
      ...sizes,
      { value: "display", label: "Display" },
      { value: "custom", label: "Custom" },
    ]),
  ).toBeUndefined();
  expect(choiceButtonKind("unrelated", sizes)).toBeUndefined();
  expect(
    choiceButtonKind(
      "thicknessPreset",
      ["one", "two", "three", "five", "custom"].map((value) => ({
        value,
        label: value,
      })),
    ),
  ).toBe("thickness");
  expect(
    choiceButtonKind("iconSizePreset", [
      ...sizes,
      { value: "custom", label: "Custom" },
    ]),
  ).toBe("size");
  expect(
    choiceButtonKind(
      "lineStyle",
      ["solid", "dashed", "dotted"].map((value) => ({ value, label: value })),
    ),
  ).toBe("line");
  expect(
    choiceButtonKind(
      "appearance",
      ["neutral", "info", "success", "warning", "danger"].map((value) => ({
        value,
        label: value,
      })),
    ),
  ).toBe("callout");
  expect(
    choiceButtonKind(
      "background",
      ["none", "color", "image"].map((value) => ({ value, label: value })),
    ),
  ).toBe("background");
  expect(
    choiceButtonKind(
      "columnStyle",
      ["plain", "cards"].map((value) => ({ value, label: value })),
    ),
  ).toBe("column-style");
  expect(
    choiceButtonKind("preset", [
      { value: "one", label: "1 column" },
      { value: "sidebar", label: "Narrow + wide + narrow" },
    ]),
  ).toBe("columns");
  expect(
    choiceButtonKind("preset", [{ value: "unrelated", label: "Other preset" }]),
  ).toBeUndefined();
  expect(
    choiceButtonKind(
      "textSize",
      ["default", "small", "medium", "large", "display", "custom"].map(
        (value) => ({ value, label: value }),
      ),
    ),
  ).toBe("text-size");
  expect(
    choiceButtonKind("mobile", [
      { value: "stack", label: "Stack" },
      { value: "keep", label: "Keep" },
    ]),
  ).toBe("responsive");
  expect(
    choiceButtonKind("imageFit", [
      { value: "cover", label: "Crop to fill" },
      { value: "contain", label: "Fit entire image" },
    ]),
  ).toBe("fit");
  expect(
    choiceButtonKind("aspectRatio", [
      { value: "original", label: "Original" },
      { value: "portrait", label: "Portrait (3:4)" },
    ]),
  ).toBe("ratio");
  expect(
    choiceButtonKind(
      "appearance",
      ["filled", "outline", "link"].map((value) => ({ value, label: value })),
    ),
  ).toBe("appearance");
  expect(
    choiceButtonKind(
      "appearance",
      ["info", "warning", "danger"].map((value) => ({ value, label: value })),
    ),
  ).toBeUndefined();
});
it("offers accessible component design choices without changing unrelated selects", () => {
  const options = [
    { value: "form", label: "Auto" },
    { value: "custom", label: "Custom" },
  ];
  expect(choiceButtonKind("designStyle", options)).toBe("component-design");
  expect(choiceButtonKind("otherStyle", options)).toBeUndefined();

  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const changed = vi.fn();
  act(() =>
    root.render(
      <ChoiceButtons
        label="Component Design"
        value="form"
        options={options}
        kind="component-design"
        onChange={changed}
      />,
    ),
  );
  expect(host.querySelector('[aria-label="Auto"]')?.textContent).toBe("Auto");
  expect(
    Array.from(host.querySelectorAll("button")).map(
      (button) => button.textContent,
    ),
  ).toEqual(["Auto", "Custom"]);
  expect(
    host.querySelector('[aria-label="Auto"]')?.getAttribute("aria-pressed"),
  ).toBe("true");
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Custom"]')!.click(),
  );
  expect(changed).toHaveBeenLastCalledWith("custom");
  const treatments = [
    { value: "soft", label: "Soft" },
    { value: "bold", label: "Bold" },
  ];
  expect(choiceButtonKind("designTreatment", treatments)).toBe(
    "component-treatment",
  );
  expect(choiceButtonKind("otherTreatment", treatments)).toBeUndefined();
  act(() =>
    root.render(
      <ChoiceButtons
        label="Treatment"
        value="soft"
        options={treatments}
        kind="component-treatment"
        onChange={changed}
      />,
    ),
  );
  expect(host.querySelector('[aria-label="Soft"]')?.textContent).toBe("Soft");
  expect(
    host.querySelector('[aria-label="Soft"]')?.getAttribute("aria-pressed"),
  ).toBe("true");
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Bold"]')!.click(),
  );
  expect(changed).toHaveBeenLastCalledWith("bold");
  for (const [handle, kind, options, selected, next] of [
    [
      "designSpacing",
      "component-spacing",
      [
        { value: "compact", label: "Compact" },
        { value: "comfortable", label: "Comfortable" },
        { value: "spacious", label: "Spacious" },
      ],
      "comfortable",
      "spacious",
    ],
    [
      "designCorners",
      "component-corners",
      [
        { value: "square", label: "Square" },
        { value: "soft", label: "Soft" },
        { value: "rounded", label: "Rounded" },
      ],
      "soft",
      "rounded",
    ],
  ] as const) {
    expect(choiceButtonKind(handle, [...options])).toBe(kind);
    expect(
      choiceButtonKind(
        handle === "designSpacing" ? "componentSpacing" : "componentCorners",
        [...options],
      ),
    ).toBe(kind);
    act(() =>
      root.render(
        <ChoiceButtons
          label={handle}
          value={selected}
          options={[...options]}
          kind={kind}
          onChange={changed}
        />,
      ),
    );
    expect(
      host
        .querySelector(
          `[aria-label="${options.find((option) => option.value === selected)?.label}"]`,
        )
        ?.getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      host.querySelectorAll("button svg[aria-hidden='true']"),
    ).toHaveLength(3);
    act(() =>
      host
        .querySelector<HTMLButtonElement>(
          `[aria-label="${options.find((option) => option.value === next)?.label}"]`,
        )!
        .click(),
    );
    expect(changed).toHaveBeenLastCalledWith(next);
  }
  act(() => root.unmount());
  host.remove();
});
it("exposes selected state, keyboard selection, and accessible labels for icon controls", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const changed = vi.fn();
  act(() =>
    root.render(
      <ChoiceButtons
        label="Alignment"
        value="center"
        options={["left", "center", "right", "justify"].map((value) => ({
          value,
          label: value,
        }))}
        kind="alignment"
        onChange={changed}
      />,
    ),
  );
  const buttons = host.querySelectorAll("button");
  expect(buttons[1].getAttribute("aria-pressed")).toBe("true");
  expect(buttons[1].getAttribute("tabindex")).toBe("0");
  expect(buttons[2].getAttribute("aria-label")).toBe("right");
  act(() =>
    buttons[1].dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    ),
  );
  expect(changed).toHaveBeenLastCalledWith("right");
  expect(document.activeElement).toBe(buttons[2]);
  act(() => buttons[3].click());
  expect(changed).toHaveBeenLastCalledWith("justify");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Appearance"
        value="outline"
        options={[
          { value: "filled", label: "Filled button" },
          { value: "outline", label: "Outline button" },
          { value: "link", label: "Text link" },
        ]}
        kind="appearance"
        onChange={changed}
      />,
    ),
  );
  expect(host.querySelector(".btngroup--exclusive")).not.toBeNull();
  expect(
    host
      .querySelector('[aria-label="Outline button"]')
      ?.getAttribute("aria-pressed"),
  ).toBe("true");
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Text link"]')!.click(),
  );
  expect(changed).toHaveBeenLastCalledWith("link");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Height"
        value="medium"
        kind="size"
        options={[
          { value: "small", label: "Small (20px)" },
          { value: "medium", label: "Medium (40px)" },
          { value: "large", label: "Large (64px)" },
          { value: "custom", label: "Custom" },
        ]}
        onChange={changed}
      />,
    ),
  );
  expect(
    host
      .querySelector('[aria-label="Medium (40px)"]')
      ?.getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    host.querySelector('[aria-label="Small (20px)"] .choice-unit')?.textContent,
  ).toBe("20px");
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Custom"]')!.click(),
  );
  expect(changed).toHaveBeenLastCalledWith("custom");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Column Layout"
        value="one"
        kind="columns"
        options={[
          { value: "one", label: "1 column" },
          { value: "two", label: "2 columns" },
          { value: "three", label: "3 columns" },
          { value: "four", label: "4 columns" },
          { value: "five", label: "5 columns" },
          { value: "six", label: "6 columns" },
          { value: "wide", label: "Wide + narrow" },
          { value: "narrow", label: "Narrow + wide" },
          { value: "three-one", label: "3:1 columns" },
          { value: "one-three", label: "1:3 columns" },
          { value: "sidebar", label: "Narrow + wide + narrow" },
        ]}
        onChange={changed}
      />,
    ),
  );
  expect(host.querySelector('[aria-label="1 column"]')?.textContent).toBe("");
  expect(
    host.querySelector('[aria-label="1 column"]')?.getAttribute("title"),
  ).toBe("1 column");
  act(() =>
    host
      .querySelector('[aria-label="1 column"]')!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      ),
  );
  expect(changed).toHaveBeenLastCalledWith("four");
  expect(document.activeElement?.getAttribute("aria-label")).toBe("4 columns");
  act(() =>
    host
      .querySelector<HTMLButtonElement>(
        '[aria-label="Narrow + wide + narrow"]',
      )!
      .click(),
  );
  expect(changed).toHaveBeenLastCalledWith("sidebar");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Appearance"
        value="info"
        kind="callout"
        options={["neutral", "info", "success", "warning", "danger"].map(
          (value) => ({ value, label: value }),
        )}
        onChange={changed}
      />,
    ),
  );
  expect(
    host.querySelector('[aria-label="info"]')?.getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    host.querySelector('[aria-label="warning"]')?.getAttribute("title"),
  ).toBe("warning");
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="success"]')!.click(),
  );
  expect(changed).toHaveBeenLastCalledWith("success");
  for (const control of [
    {
      kind: "background" as const,
      label: "Background",
      value: "none",
      options: [
        { value: "none", label: "None" },
        { value: "color", label: "Color" },
        { value: "image", label: "Image" },
      ],
      chosen: "image",
      button: "Image",
    },
    {
      kind: "column-style" as const,
      label: "Column Style",
      value: "plain",
      options: [
        { value: "plain", label: "Plain" },
        { value: "cards", label: "Cards" },
      ],
      chosen: "cards",
      button: "Cards",
    },
  ]) {
    act(() => root.render(<ChoiceButtons {...control} onChange={changed} />));
    act(() =>
      host
        .querySelector<HTMLButtonElement>(`[aria-label="${control.button}"]`)!
        .click(),
    );
    expect(changed).toHaveBeenLastCalledWith(control.chosen);
  }
  const crops = [
    "top-left",
    "top",
    "top-right",
    "left",
    "center",
    "right",
    "bottom-left",
    "bottom",
    "bottom-right",
  ];
  act(() =>
    root.render(
      <ChoiceButtons
        label="Crop Position"
        value="center"
        kind="crop"
        options={crops.map((value) => ({ value, label: value }))}
        onChange={changed}
      />,
    ),
  );
  act(() =>
    host
      .querySelector('[aria-label="center"]')!
      .dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      ),
  );
  expect(changed).toHaveBeenLastCalledWith("bottom");
  expect(document.activeElement?.getAttribute("aria-label")).toBe("bottom");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Aspect Ratio"
        value="original"
        kind="ratio"
        options={[
          { value: "original", label: "Original" },
          { value: "portrait", label: "Portrait (9:16)" },
        ]}
        onChange={changed}
      />,
    ),
  );
  expect(
    host.querySelector('[aria-label="Portrait (9:16)"]')?.textContent,
  ).toBe("9:16");
  const shape = host.querySelector('[aria-label="Portrait (9:16)"] rect');
  expect(Number(shape?.getAttribute("height"))).toBeGreaterThan(
    Number(shape?.getAttribute("width")),
  );
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Portrait (9:16)"]')!
      .click(),
  );
  expect(changed).toHaveBeenLastCalledWith("portrait");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Image Fit"
        value="cover"
        kind="fit"
        options={[
          { value: "cover", label: "Crop to fill" },
          { value: "contain", label: "Fit entire image" },
        ]}
        onChange={changed}
      />,
    ),
  );
  expect(
    host
      .querySelector('[aria-label="Crop to fill"]')
      ?.getAttribute("aria-pressed"),
  ).toBe("true");
  act(() =>
    host
      .querySelector<HTMLButtonElement>('[aria-label="Fit entire image"]')!
      .click(),
  );
  expect(changed).toHaveBeenLastCalledWith("contain");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Columns On Smaller Screens"
        value="stack"
        kind="responsive"
        options={[
          { value: "stack", label: "Stack" },
          { value: "keep", label: "Keep" },
        ]}
        onChange={changed}
      />,
    ),
  );
  expect(
    host.querySelector('[aria-label="Stack"]')?.getAttribute("aria-pressed"),
  ).toBe("true");
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Keep"]')!.click(),
  );
  expect(changed).toHaveBeenLastCalledWith("keep");
  act(() =>
    root.render(
      <ChoiceButtons
        label="Text Size"
        value="default"
        kind="text-size"
        options={[
          { value: "default", label: "Template default" },
          { value: "small", label: "Small (24px)" },
          { value: "medium", label: "Medium (32px)" },
          { value: "large", label: "Large (48px)" },
          { value: "display", label: "Display (64px)" },
          { value: "custom", label: "Custom" },
        ]}
        onChange={changed}
      />,
    ),
  );
  expect(host.querySelector('[aria-label="Display (64px)"]')?.textContent).toBe(
    "XL64px",
  );
  act(() =>
    host.querySelector<HTMLButtonElement>('[aria-label="Custom"]')!.click(),
  );
  expect(changed).toHaveBeenLastCalledWith("custom");
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("shows icons with visible labels for all playback groups and percentage labels for overlay opacity", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const changed = vi.fn();
  for (const [handle, label, values] of [
    [
      "playback",
      "Playback",
      [
        ["manual", "Click to play"],
        ["autoplay", "Autoplay (muted)"],
      ],
    ],
    [
      "playerControls",
      "Player Controls",
      [
        ["show", "Show"],
        ["hide", "Hide"],
      ],
    ],
    [
      "loopPlayback",
      "Loop",
      [
        ["once", "Play once"],
        ["loop", "Loop"],
      ],
    ],
    [
      "overlayOpacityPreset",
      "Overlay Opacity",
      [
        ["light", "10%"],
        ["quarter", "25%"],
        ["half", "50%"],
        ["strong", "75%"],
        ["custom", "Custom"],
      ],
    ],
  ] as const) {
    const options = values.map(([value, label]) => ({ value, label }));
    const kind = choiceButtonKind(handle, options)!;
    expect(kind).toBe(
      handle === "overlayOpacityPreset" ? "opacity" : "playback",
    );
    act(() =>
      root.render(
        <ChoiceButtons
          label={label}
          value={options[0].value}
          kind={kind}
          options={options}
          onChange={changed}
        />,
      ),
    );
    const buttons = host.querySelectorAll("button");
    expect(buttons[0].textContent).toBe(options[0].label);
    expect(buttons[0].querySelector("svg")).not.toBeNull();
    expect(buttons[0].getAttribute("aria-pressed")).toBe("true");
    act(() => buttons[1].click());
    expect(changed).toHaveBeenLastCalledWith(options[1].value);
  }
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it("renders card border weights and corner shapes with pixel labels and a Custom choice", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const changed = vi.fn();
  for (const [handle, label, values, expectedKind] of [
    [
      "cardBorderWidthPreset",
      "Card Border Width",
      [
        ["none", "0px (none)"],
        ["one", "1px"],
        ["two", "2px"],
        ["three", "3px"],
        ["custom", "Custom"],
      ],
      "thickness",
    ],
    [
      "cardRadiusPreset",
      "Card Corner Radius",
      [
        ["three", "3px"],
        ["five", "5px"],
        ["ten", "10px"],
        ["fifteen", "15px"],
        ["twenty", "20px"],
        ["custom", "Custom"],
      ],
      "corner-radius",
    ],
  ] as const) {
    const options = values.map(([value, label]) => ({ value, label }));
    const kind = choiceButtonKind(handle, options)!;
    expect(kind).toBe(expectedKind);
    act(() =>
      root.render(
        <ChoiceButtons
          label={label}
          value={options[0].value}
          kind={kind}
          options={options}
          onChange={changed}
        />,
      ),
    );
    expect(host.querySelector("button")?.textContent).toBe(
      handle === "cardRadiusPreset" ? "3px" : "0px",
    );
    expect(host.querySelector("svg")).not.toBeNull();
    act(() =>
      host.querySelector<HTMLButtonElement>('[aria-label="Custom"]')!.click(),
    );
    expect(changed).toHaveBeenLastCalledWith("custom");
    act(() =>
      host
        .querySelector("button")!
        .dispatchEvent(
          new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
        ),
    );
    expect(changed).toHaveBeenLastCalledWith(options[1].value);
  }
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
