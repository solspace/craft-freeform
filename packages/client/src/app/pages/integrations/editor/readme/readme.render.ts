import translate from "@ff-client/utils/translations";
import DOMPurify from "dompurify";
import { Marked } from "marked";
import Prism from "prismjs";
import "prismjs/components/prism-markup-templating";
import "prismjs/components/prism-json";
import "prismjs/components/prism-php";
import "prismjs/components/prism-twig";

Prism.manual = true;

const languages: Record<string, { grammar: string; label: string }> = {
  html: { grammar: "markup", label: "HTML" },
  markup: { grammar: "markup", label: "HTML" },
  css: { grammar: "css", label: "CSS" },
  js: { grammar: "javascript", label: "JavaScript" },
  javascript: { grammar: "javascript", label: "JavaScript" },
  twig: { grammar: "twig", label: "Twig" },
  json: { grammar: "json", label: "JSON" },
  php: { grammar: "php", label: "PHP" },
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const markdown = new Marked({
  gfm: true,
  async: false,
  renderer: {
    code({ text, lang }) {
      const name = (lang ?? "").trim().split(/\s+/)[0].toLowerCase();
      const language = Object.hasOwn(languages, name)
        ? languages[name]
        : undefined;
      const highlighted = language
        ? Prism.highlight(
            text,
            Prism.languages[language.grammar],
            language.grammar,
          )
        : escapeHtml(text);
      const attributes = language ? ` data-language="${language.label}"` : "";
      const codeClass = language ? ` class="language-${language.grammar}"` : "";
      return `<div class="readme-code-block"><div class="readme-code-header"><span>${language?.label ?? ""}</span><button type="button" class="readme-copy"><svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="5" y="5" width="8" height="9" rx="1.5"/><path d="M10 5V3.5A1.5 1.5 0 0 0 8.5 2h-5A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg><span class="readme-copy-label" aria-live="polite">${escapeHtml(translate("Copy code"))}</span></button></div><pre${attributes}><code${codeClass}>${highlighted}</code></pre><span class="readme-copy-status" role="status" aria-live="polite"></span></div>\n`;
    },
  },
});

/** Sanitize after highlighting so code examples can never become executable HTML. */
export function renderReadme(content: string): string {
  return DOMPurify.sanitize(markdown.parse(content, { async: false }));
}
