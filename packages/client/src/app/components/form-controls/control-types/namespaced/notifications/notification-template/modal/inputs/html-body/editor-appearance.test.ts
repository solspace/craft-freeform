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
  const doc = document.implementation.createHTMLDocument("Email");
  doc.body.innerHTML =
    '<div style="background-color: white"><h1 style="color:#263445">Hello</h1><img src="logo.png" style="width:80px"><span data-freeform-token="form.name">Form Name</span></div>';
  const authored = doc.body.outerHTML;
  const handlers = new Map<string, () => void>();
  const editor = {
    getDoc: () => doc,
    on: (event: string, callback: () => void) => handlers.set(event, callback),
  } as unknown as Editor;
  setupNotificationEditorAppearance(editor);
  cleanups.push(() => handlers.get("remove")?.());
  return { doc, authored, handlers };
}

describe("notification editing appearance", () => {
  it("themes only the editing document and preserves authored email HTML and images", () => {
    document.documentElement.dataset.darkMode = "dark";
    const { doc, authored, handlers } = fixture();
    handlers.get("init")?.();
    expect(doc.documentElement.hasAttribute("data-freeform-dark-editor")).toBe(
      true,
    );
    expect(doc.head.querySelector("style")?.textContent).toContain(
      "color-scheme: dark",
    );
    expect(doc.body.outerHTML).toBe(authored);
    expect(doc.body.querySelector("style")).toBeNull();
  });

  it("restores authored appearance when switching to light without editing or saving content", () => {
    document.documentElement.dataset.darkMode = "dark";
    const { doc, authored, handlers } = fixture();
    handlers.get("init")?.();
    document.documentElement.dataset.darkMode = "light";
    document.dispatchEvent(new Event("craft-dark-mode:change"));
    expect(doc.documentElement.hasAttribute("data-freeform-dark-editor")).toBe(
      false,
    );
    expect(doc.body.outerHTML).toBe(authored);
    document.documentElement.dataset.darkMode = "dark";
    document.dispatchEvent(new Event("craft-dark-mode:change"));
    expect(doc.documentElement.hasAttribute("data-freeform-dark-editor")).toBe(
      true,
    );
    expect(doc.head.querySelectorAll("style")).toHaveLength(1);
  });

  it("removes its theme listener and stylesheet when the editor closes", () => {
    document.documentElement.dataset.darkMode = "dark";
    const { doc, authored, handlers } = fixture();
    handlers.get("init")?.();
    handlers.get("remove")?.();
    document.dispatchEvent(new Event("craft-dark-mode:change"));
    expect(doc.documentElement.hasAttribute("data-freeform-dark-editor")).toBe(
      false,
    );
    expect(doc.head.querySelector("style")).toBeNull();
    expect(doc.body.outerHTML).toBe(authored);
  });
});
