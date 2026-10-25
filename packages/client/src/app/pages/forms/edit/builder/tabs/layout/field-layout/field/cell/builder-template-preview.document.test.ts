import { expect, it } from "vitest";
import { buildBuilderTemplatePreviewDocument } from "./builder-template-preview.document";

it("keeps useful Twig markup while stripping active content from the builder frame", () => {
  const document = buildBuilderTemplatePreviewDocument(
    '<aside style="color: teal"><h2>Sidebar</h2><img src="/image.png" onerror="alert(1)"><script>alert(2)</script><iframe src="https://example.com"></iframe></aside>',
  );

  expect(document).toContain('<aside style="color: teal">');
  expect(document).toContain("Sidebar");
  expect(document).not.toContain("onerror");
  expect(document).not.toContain("<script");
  expect(document).not.toContain("<iframe");
  expect(document).toContain("form-action 'none'");
});
