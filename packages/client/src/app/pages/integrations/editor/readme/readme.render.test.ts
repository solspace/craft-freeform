import { describe, expect, it } from "vitest";
import { renderReadme } from "./readme.render";

describe("integration README code examples", () => {
  it.each([
    ["html", '<form method="post"><button>Send</button></form>', "HTML"],
    ["css", ".form { color: red; }", "CSS"],
    ["js", 'const form = document.querySelector("form");', "JavaScript"],
    ["javascript", "const ready = true;", "JavaScript"],
    ["twig", "<p>{{ form.name }}</p>{% if form %}Ready{% endif %}", "Twig"],
    ["json", '{"enabled": true, "threshold": 0.5}', "JSON"],
    ["php", "<?php echo $form->render();", "PHP"],
  ])(
    "highlights %s without changing the copyable example",
    (language, code, label) => {
      const container = document.createElement("div");
      container.innerHTML = renderReadme(`\`\`\`${language}\n${code}\n\`\`\``);
      expect(container.querySelector("pre")?.dataset.language).toBe(label);
      expect(container.querySelector("code")?.textContent).toBe(code);
      expect(container.querySelectorAll(".token").length).toBeGreaterThan(0);
    },
  );

  it.each(["", "text", "unknown", "constructor", "__proto__"])(
    "keeps unsupported %s blocks as escaped plain text",
    (language) => {
      const container = document.createElement("div");
      container.innerHTML = renderReadme(
        `\`\`\`${language}\n<div>Example</div>\n\`\`\``,
      );
      expect(container.querySelector("code")?.textContent?.trimEnd()).toBe(
        "<div>Example</div>",
      );
      expect(container.querySelector("code div")).toBeNull();
      expect(container.querySelector(".token")).toBeNull();
    },
  );

  it("keeps markup inside examples inert and sanitizes the surrounding instructions", () => {
    const code =
      '</code><img src=x onerror="alert(1)"><script>alert(1)</script>';
    const container = document.createElement("div");
    container.innerHTML = renderReadme(
      `<details><summary onclick="alert(1)">Help</summary>\n\n\`\`\`html\n${code}\n\`\`\`\n\n</details><script>alert(1)</script>`,
    );
    expect(container.querySelector("code")?.textContent).toBe(code);
    expect(
      container.querySelector("script, img, [onclick], [onerror]"),
    ).toBeNull();
    expect(container.querySelector("details > summary")?.textContent).toBe(
      "Help",
    );
  });
});
