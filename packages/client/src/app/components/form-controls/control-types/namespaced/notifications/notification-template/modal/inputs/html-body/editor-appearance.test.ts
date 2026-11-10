import type { Editor } from "tinymce";
import { afterEach, describe, expect, it } from "vitest";

import { setupNotificationEditorAppearance } from "./editor-appearance";

const cleanups: (() => void)[] = [];
afterEach(() => {
  cleanups.splice(0).forEach((cleanup) => {
    cleanup();
  });
  delete document.documentElement.dataset.darkMode;
});

function fixture() {
  const frame = document.createElement("iframe");
  document.body.appendChild(frame);
  const doc = frame.contentDocument!;
  doc.body.innerHTML =
    '<div style="background-color: white"><h1 style="color:#263445">Hello</h1><img src="logo.png" style="width:80px"><p><span style="color:#cf1124;background-color:#fff2cc">Authored color</span></p><span data-freeform-token="form.name">Form Name</span></div>';
  const authored = doc.body.outerHTML;
  const handlers = new Map<string, () => void>();
  const editor = {
    getDoc: () => doc,
    on: (event: string, callback: () => void) => handlers.set(event, callback),
  } as unknown as Editor;
  setupNotificationEditorAppearance(editor);
  cleanups.push(() => {
    handlers.get("remove")?.();
    frame.remove();
  });
  return { doc, authored, handlers };
}

function expectLightCanvas(doc: Document) {
  const computed = doc.defaultView!.getComputedStyle(doc.body);
  expect(computed.backgroundColor).toBe("rgb(255, 255, 255)");
  expect(computed.color).toBe("rgb(38, 52, 69)");
  expect(
    doc.defaultView!.getComputedStyle(doc.documentElement).colorScheme,
  ).toBe("light");
}

describe("notification editing appearance", () => {
  it.each(["dark", "light"])(
    "keeps a light email canvas and authored colors in Craft %s mode",
    (mode) => {
      document.documentElement.dataset.darkMode = mode;
      const { doc, authored, handlers } = fixture();
      handlers.get("init")?.();
      expectLightCanvas(doc);
      const color = doc.defaultView!.getComputedStyle(
        doc.body.querySelector("p span")!,
      );
      expect(color.color).toBe("rgb(207, 17, 36)");
      expect(color.backgroundColor).toBe("rgb(255, 242, 204)");
      expect(doc.body.outerHTML).toBe(authored);
      expect(doc.body.querySelector("style")).toBeNull();
    },
  );

  it("keeps the authored email unchanged when Craft appearance changes", () => {
    const { doc, authored, handlers } = fixture();
    handlers.get("init")?.();
    for (const mode of ["dark", "light", "dark"]) {
      document.documentElement.dataset.darkMode = mode;
      document.dispatchEvent(new Event("craft-dark-mode:change"));
      expectLightCanvas(doc);
      expect(doc.body.outerHTML).toBe(authored);
    }
    expect(doc.head.querySelectorAll("style")).toHaveLength(1);
  });

  it("removes its editing stylesheet when the editor closes", () => {
    const { doc, authored, handlers } = fixture();
    handlers.get("init")?.();
    handlers.get("remove")?.();
    expect(doc.head.querySelector("style")).toBeNull();
    expect(doc.body.outerHTML).toBe(authored);
  });
});
