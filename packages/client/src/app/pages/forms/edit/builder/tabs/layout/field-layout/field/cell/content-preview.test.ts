import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  buttonLinkPresentation,
  contentIconMarkup,
  contentVideoStyles,
} from "@ff-client/utils/content-presentation";
import template from "lodash/template";
import { expect, it } from "vitest";

const render = (name: string, properties: Record<string, unknown>): Document =>
  new DOMParser().parseFromString(
    template(
      readFileSync(
        resolve(
          process.cwd(),
          `../plugin/src/Fields/Implementations/PreviewTemplates/${name}.ejs`,
        ),
        "utf8",
      ),
    )(properties),
    "text/html",
  );

it("renders legacy callouts literally and preserves empty rich text", () => {
  const legacy = render("callout", {
    content: "<strong>Literal</strong>\nSecond line",
    appearance: "info",
  });
  expect(legacy.querySelector("strong")).toBeNull();
  expect(legacy.body.textContent).toContain(
    "<strong>Literal</strong>\nSecond line",
  );
  const cleared = render("callout", {
    content: "Old text",
    richContent: "",
    appearance: "info",
  });
  expect(cleared.body.textContent).not.toContain("Old text");
});
it("previews formatted callouts with their selected alignment", () => {
  const document = render("callout", {
    content: "Old text",
    richContent:
      '<p style="text-align: center;"><strong>Note</strong> <a href="https://example.test">More</a></p><ul><li>One</li></ul>',
    appearance: "warning",
  });
  expect(document.querySelector("strong")?.textContent).toBe("Note");
  expect(document.querySelector("li")?.textContent).toBe("One");
  expect(document.querySelector("a")?.getAttribute("href")).toBe(
    "https://example.test",
  );
  expect(document.querySelector("p")?.getAttribute("style")).toContain(
    "text-align: center",
  );
  expect(document.body.textContent).not.toContain("Old text");
});
it("previews a divider with the requested line style and spacing", () => {
  const document = render("divider", { lineStyle: "dashed", spacing: "large" });
  const rule = document.querySelector("hr")!;
  expect(rule.style.color).toBe("inherit");
  expect(rule.style.borderTopStyle).toBe("dashed");
  expect(rule.style.marginTop).toBe("32px");
  expect(rule.style.borderTopWidth).toBe("1px");
  expect(rule.style.opacity).toBe("0.25");
});
it("previews a custom divider color and thickness", () => {
  const document = render("divider", {
    lineStyle: "dotted",
    spacing: "small",
    lineColor: "#2563eb",
    thickness: 4,
  });
  const rule = document.querySelector("hr")!;
  expect(rule.style.borderTopWidth).toBe("4px");
  expect(rule.style.borderTopColor).toBe("rgb(37, 99, 235)");
  expect(rule.style.opacity).toBe("1");
});
it.each([
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["five", 5],
  ["custom", 4],
  [undefined, 4],
])(
  "previews divider thickness preset %s while preserving custom values",
  (thicknessPreset, expected) => {
    const document = render("divider", {
      lineStyle: "solid",
      spacing: "medium",
      thicknessPreset,
      thickness: 4,
    });
    expect(document.querySelector("hr")!.style.borderTopWidth).toBe(
      `${expected}px`,
    );
  },
);

it.each([
  ["success", "#15803d"],
  ["danger", "#b91c1c"],
  ["warning", "#d97706"],
])("previews the %s Callout color", (appearance, color) => {
  const document = render("callout", { content: "A note", appearance });
  expect(
    document.querySelector(".freeform-callout")?.getAttribute("style"),
  ).toContain(`border-inline-start: 3px solid ${color}`);
});

it("previews an aligned, escaped button link with the selected appearance", () => {
  const properties = {
    linkText: "<Next>",
    url: "/next",
    appearance: "outline",
    alignment: "right",
    size: "large",
    newTab: true,
  };
  const document = render("button-link", {
    ...properties,
    ...buttonLinkPresentation(properties),
  });
  const link = document.querySelector("a")!;
  expect(link.textContent).toBe("<Next>");
  expect(link.getAttribute("href")).toBe("/next");
  expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  expect(link.style.fontSize).toBe("18px");
  expect(link.parentElement?.style.textAlign).toBe("right");
});
it("previews a centered accessible icon using Craft vector artwork", () => {
  const properties = {
    iconSize: 64,
    color: "#1d4ed8",
    alignment: "center",
    accessibleText: "Email us",
  };
  const document = render("icon", {
    ...properties,
    iconMarkup: contentIconMarkup(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true"><path d="M0 0h512v512H0z"/></svg>',
      properties,
    ),
  });
  const icon = document.querySelector("svg")!;
  expect(icon.getAttribute("aria-label")).toBe("Email us");
  expect(icon.getAttribute("width")).toBe("64");
  expect(icon.querySelector("path")?.getAttribute("d")).toBe("M0 0h512v512H0z");
  expect(icon.parentElement?.style.justifyContent).toBe("center");
  expect(icon.getAttribute("aria-hidden")).toBeNull();
  expect(icon.getAttribute("viewBox")).toBe("0 0 512 512");
});
it.each([
  ["small", 24],
  ["medium", 48],
  ["large", 64],
  ["custom", 91],
  [undefined, 91],
])(
  "renders icon size preset %s without changing legacy custom sizes",
  (iconSizePreset, expected) => {
    const svg = contentIconMarkup(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M0 0h24v24z"/></svg>',
      { iconSizePreset, iconSize: 91 },
    );
    expect(
      new DOMParser()
        .parseFromString(svg, "image/svg+xml")
        .documentElement.getAttribute("width"),
    ).toBe(String(expected));
  },
);
it("previews video without loading an external player", () => {
  const document = render("video", {
    aspectRatio: "square",
    videoTitle: "Our story",
    videoMessage: "Video player loads on the published form.",
    videoStyles: contentVideoStyles({ aspectRatio: "square" }),
  });
  expect(document.querySelector("iframe")).toBeNull();
  expect(document.body.textContent).toContain("Our story");
  expect(document.body.querySelector("div")?.style.aspectRatio).toBe("1 / 1");
});
it("previews a centered video with a bounded width and chosen aspect ratio", () => {
  const document = render("video", {
    videoTitle: "Our story",
    videoMessage: "Preview",
    videoStyles: contentVideoStyles({
      aspectRatio: "portrait",
      alignment: "center",
      maximumWidth: 420,
    }),
  });
  const video = document.body.querySelector("div")!;
  expect(video.style.maxWidth).toBe("420px");
  expect(video.style.marginLeft).toBe("auto");
  expect(video.style.marginRight).toBe("auto");
  expect(video.style.aspectRatio).toBe("9 / 16");
});
it.each(["h5", "h6"])(
  "previews semantic %s with an independent visual size",
  (level) => {
    const document = render("heading", {
      level,
      alignment: "right",
      textSize: "large",
      fontSize: 72,
      content: "Heading",
    });
    expect(document.querySelector(level)?.textContent).toBe("Heading");
    expect(document.querySelector(level)?.getAttribute("style")).toContain(
      "48px",
    );
  },
);
