import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import template from "lodash/template";
import { expect, it } from "vitest";

const render = template(
  readFileSync(
    resolve(
      process.cwd(),
      "../plugin/src/Fields/Implementations/PreviewTemplates/signature.ejs",
    ),
    "utf8",
  ),
);
const stored = {
  width: 300,
  height: 200,
  showClearButton: true,
  borderColor: "#999999",
  backgroundColor: "#000000",
  penColor: "#ffffff",
};
function preview(customizeAppearance?: boolean) {
  const props = {
    ...stored,
    ...(customizeAppearance === undefined ? {} : { customizeAppearance }),
  };
  const host = document.createElement("div");
  host.innerHTML = render(props);
  expect(props).toEqual({
    ...stored,
    ...(customizeAppearance === undefined ? {} : { customizeAppearance }),
  });
  return {
    pad: host.querySelector<HTMLElement>(".ff-signature-preview__pad")!,
    path: host.querySelector("path")!,
    wrapper: host.querySelector<HTMLElement>(".ff-signature-preview")!,
  };
}

it("uses input appearance for new non-custom fields without changing stored colors", () => {
  const { pad, path, wrapper } = preview(false);
  expect(path.getAttribute("stroke")).toBe("#000000");
  expect(pad.style.backgroundColor).toContain("var(--white");
  expect(pad.style.getPropertyValue("--ff-signature-preview-border")).toBe("");
  expect(wrapper.style.maxWidth).toBe("375px");
});

it.each([true, undefined])(
  "keeps custom and legacy appearance, even colors matching the old defaults: %s",
  (mode) => {
    const { pad, path } = preview(mode);
    expect(path.getAttribute("stroke")).toBe("#ffffff");
    expect(pad.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(pad.style.getPropertyValue("--ff-signature-preview-border")).toBe(
      "#999999",
    );
  },
);

it("renders an explicitly transparent custom border", () => {
  const host = document.createElement("div");
  host.innerHTML = render({
    ...stored,
    customizeAppearance: true,
    borderColor: "rgba(0,0,0,0)",
  });
  expect(
    host
      .querySelector<HTMLElement>(".ff-signature-preview__pad")!
      .style.getPropertyValue("--ff-signature-preview-border"),
  ).toBe("rgba(0,0,0,0)");
});
