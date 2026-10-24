import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import template from "lodash/template";
import { expect, it } from "vitest";

const render = template(
  readFileSync(
    resolve(
      process.cwd(),
      "../plugin/src/Fields/Implementations/PreviewTemplates/image.ejs",
    ),
    "utf8",
  ),
  { interpolate: /<%=([\s\S]+?)%>/g, escape: /<%-([\s\S]+?)%>/g },
);
const properties = {
  assetId: 10,
  transform: "",
  fetchedAssets: { 10: { src: "/image.jpg", title: "Image" } },
  customizeDisplay: false,
  displayWidth: 280,
  aspectRatio: "square",
  imageFit: "cover",
  cropPosition: "top",
};
it("keeps legacy image previews unchanged until display customization is enabled", () => {
  const document = new DOMParser().parseFromString(
    render(properties),
    "text/html",
  );
  expect(document.querySelector("img")?.getAttribute("style")).toBeNull();
  expect(document.querySelector("img")?.getAttribute("src")).toBe("/image.jpg");
});
it("previews a responsive square crop without changing its asset URL", () => {
  const document = new DOMParser().parseFromString(
    render({ ...properties, customizeDisplay: true }),
    "text/html",
  );
  const image = document.querySelector("img")!;
  expect(image.style.width).toBe("280px");
  expect(image.style.aspectRatio).toBe("1 / 1");
  expect(image.style.objectFit).toBe("cover");
  expect(image.style.objectPosition).toBe("top");
  expect(image.getAttribute("src")).toBe("/image.jpg");
});
it.each([
  ["top-left", "left top"],
  ["top-right", "right top"],
  ["bottom-left", "left bottom"],
  ["bottom-right", "right bottom"],
])("previews the %s corner crop", (cropPosition, expected) => {
  const document = new DOMParser().parseFromString(
    render({ ...properties, customizeDisplay: true, cropPosition }),
    "text/html",
  );
  expect(document.querySelector("img")?.style.objectPosition).toBe(expected);
  expect(document.querySelector("img")?.getAttribute("src")).toBe("/image.jpg");
});
