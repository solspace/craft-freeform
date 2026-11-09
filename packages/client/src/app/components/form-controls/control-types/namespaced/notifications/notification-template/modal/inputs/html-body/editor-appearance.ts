import type { Editor } from "tinymce";

// Keep authored email colors visible while the surrounding editor chrome follows
// Craft's appearance. This stylesheet is never included in the saved email HTML.
export function setupNotificationEditorAppearance(editor: Editor): void {
  let style: HTMLStyleElement | undefined;

  editor.on("init", () => {
    const doc = editor.getDoc();
    if (!doc?.head || style) return;
    style = doc.createElement("style");
    style.dataset.freeformEditorAppearance = "";
    style.textContent = `
      html { color-scheme: light; background: #fff; }
      body { color: #263445; background: #fff; }
    `;
    doc.head.appendChild(style);
  });

  editor.on("remove", () => style?.remove());
}
