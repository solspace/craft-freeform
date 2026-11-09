import type { Editor } from "tinymce";

// This stylesheet lives in the editor document's head, never in its saved HTML.
// The Preview tab continues to render the template's authored appearance.
export function setupNotificationEditorAppearance(editor: Editor): void {
  let style: HTMLStyleElement | undefined;
  let editorDocument: Document | undefined;

  const sync = (): void => {
    const doc = editor.getDoc();
    if (!doc?.head) return;
    editorDocument = doc;
    if (!style) {
      style = doc.createElement("style");
      style.dataset.freeformEditorAppearance = "";
      doc.head.appendChild(style);
    }
    const root = document.documentElement;
    const dark = root.dataset.darkMode === "dark";
    doc.documentElement.toggleAttribute("data-freeform-dark-editor", dark);
    if (!dark) return;
    const theme = getComputedStyle(root);
    const color = (name: string, fallback: string): string =>
      theme.getPropertyValue(name).trim() || fallback;
    const text = color("--text-color", "#c9d1d9");
    const background = color("--input-bg", "#21262d");
    const border = color("--input-border-color", "#555e69");
    const link = color("--link-color", "#82b2e2");
    const selection = color("--bg-selection-light", "#30363d");
    style.textContent = `
      html[data-freeform-dark-editor] { color-scheme: dark; background: ${background}; }
      html[data-freeform-dark-editor] body {
        color: ${text} !important; background: ${background} !important; caret-color: ${text};
      }
      html[data-freeform-dark-editor] body :is(div, p, span, h1, h2, h3, h4, h5, h6,
        table, thead, tbody, tfoot, tr, th, td, ul, ol, li, blockquote, strong, em, b, i, font) {
        color: inherit !important; background-color: transparent !important;
      }
      html[data-freeform-dark-editor] body :is(a, a span) { color: ${link} !important; }
      html[data-freeform-dark-editor] body :is(table, th, td, hr) { border-color: ${border} !important; }
      html[data-freeform-dark-editor] body :is(code, pre, span[data-freeform-token]) {
        color: ${text} !important; background: ${selection} !important; border-color: ${border} !important;
      }
      html[data-freeform-dark-editor] ::selection { background: ${selection}; color: ${text}; }
    `;
  };

  editor.on("init", sync);
  document.addEventListener("craft-dark-mode:change", sync);
  editor.on("remove", () => {
    document.removeEventListener("craft-dark-mode:change", sync);
    style?.remove();
    editorDocument?.documentElement.removeAttribute(
      "data-freeform-dark-editor",
    );
  });
}
