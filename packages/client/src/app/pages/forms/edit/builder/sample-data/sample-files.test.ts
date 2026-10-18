import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import template from "lodash/template";
import { afterEach, expect, it, vi } from "vitest";
import { selectSampleFile, selectSampleFiles } from "./sample-files";

afterEach(() => vi.restoreAllMocks());

it.each(["image", "pdf", "text"])(
  "previews a compatible %s fixture in both upload types without changing saved properties",
  (kind) => {
    const file = selectSampleFile([kind]);
    expect(file?.kind).toBe(kind);
    expect(file?.url).toBe(`data:${file?.mime};base64,${file?.data}`);
    expect(selectSampleFile([kind], 0.001)).toBeUndefined();
    for (const name of ["file-upload", "file-drag-n-drop"]) {
      const render = template(
        readFileSync(
          resolve(
            import.meta.dirname,
            "../../../../../../../../plugin/src/Fields/Implementations/PreviewTemplates",
            `${name}.ejs`,
          ),
          "utf8",
        ),
      );
      const properties = {
        fileKinds: [kind],
        theme: "light",
        accent: "#009688",
        placeholder: "Drop a file",
        showUploadRequirements: true,
        fileCount: 1,
        maxFileSizeKB: 2048,
      };
      const host = document.createElement("div");
      host.innerHTML = render({ ...properties, sampleFile: file });
      expect(host.textContent).toContain(file!.name);
      expect(host.querySelectorAll("img")).toHaveLength(
        kind === "image" ? 1 : 0,
      );
      expect(host.querySelector("input")).toBeNull();
      host.innerHTML = render(properties);
      expect(host.textContent).not.toContain(file!.name);
      expect(properties).not.toHaveProperty("sampleFile");
    }
  },
);

it("omits fixtures for unsupported kinds and uses the normal limit when unset", () => {
  expect(selectSampleFile(["audio", "video"])).toBeUndefined();
  expect(selectSampleFile([], 0)).toBeDefined();
});

it("chooses from five image designs and avoids duplicates within a multi-file sample", () => {
  const random = vi.spyOn(Math, "random");
  const appearances = new Set<string>();
  for (let index = 0; index < 5; index++) {
    random.mockReturnValue(index / 5 + 0.01);
    appearances.add(selectSampleFile(["image"])!.data);
  }
  expect(appearances.size).toBe(5);
  random.mockReturnValue(0.999);
  const files = selectSampleFiles(["image"], 2048, 10);
  expect(files).toHaveLength(3);
  expect(new Set(files.map((file) => file.data)).size).toBe(3);
  expect(files.every((file) => file.size <= 2048 * 1000)).toBe(true);
});

it.each([
  [1, 1],
  [2, 2],
  [3, 3],
  [10, 3],
])(
  "limits random samples to %s files with a cap of three",
  (maximum, expected) => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.999);
    const files = selectSampleFiles(["image"], 2048, maximum);
    expect(files).toHaveLength(expected);
    expect(new Set(files.map((file) => file.name)).size).toBe(expected);
    random.mockReturnValue(0);
    expect(selectSampleFiles(["image"], 2048, maximum)).toHaveLength(1);
  },
);

it("can choose two samples and renders every file in the preview", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  const files = selectSampleFiles(["image"], 2048, 3);
  expect(files).toHaveLength(2);
  const render = template(
    readFileSync(
      resolve(
        import.meta.dirname,
        "../../../../../../../../plugin/src/Fields/Implementations/PreviewTemplates/file-drag-n-drop.ejs",
      ),
      "utf8",
    ),
  );
  const host = document.createElement("div");
  host.innerHTML = render({
    sampleFile: files[0],
    sampleFiles: files,
    accent: "#009688",
    theme: "light",
    showUploadRequirements: false,
  });
  expect(host.querySelectorAll("img")).toHaveLength(2);
  for (const file of files) expect(host.textContent).toContain(file.name);
});
