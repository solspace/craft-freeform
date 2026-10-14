import Tagify from "@yaireo/tagify";
import { afterEach, expect, it, vi } from "vitest";
import { generateValue } from "../app/components/form-controls/control-types/ai-box/field-selection.hooks";
import { serializeFieldTags } from "./field-tags";

const instances: Tagify[] = [];
const handles = ["message", "firstName", "emailAddress"];
const editor = (value: string): Tagify => {
  const input = document.createElement("textarea");
  input.value = generateValue(value);
  document.body.append(input);
  const tagify = new Tagify(input, {
    mode: "mix",
    pattern: /@/,
    enforceWhitelist: true,
    editTags: false,
    duplicates: true,
    whitelist: handles,
  });
  instances.push(tagify);
  return tagify;
};
afterEach(() => {
  instances.splice(0).forEach((instance) => {
    instance.destroy();
  });
  document.body.replaceChildren();
});

it("round-trips real adjacent Tagify chips without a space", () => {
  const tagify = editor("field:message");
  // The caret is immediately after the chip, before Tagify's trailing text.
  const range = document.createRange();
  range.setStartAfter(tagify.getTagElms()[0]);
  range.collapse(true);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  tagify.injectAtCaret(tagify.createTagElem({ value: "firstName" }), range);
  expect(tagify.getTagElms()).toHaveLength(2);
  const saved = serializeFieldTags(tagify.getMixedTagsAsString());
  expect(saved).toBe("field:message field:firstName");
  const reopened = editor(saved);
  expect(reopened.value.map((tag) => tag.value)).toEqual([
    "message",
    "firstName",
  ]);
});

it("excludes removed chips while their removal animation is still running", async () => {
  const tagify = editor("field:message field:firstName field:emailAddress");
  const removed = tagify.getTagElms()[1];
  tagify.removeTags(removed, false, 300);
  await vi.waitFor(() => {
    expect(tagify.value.map((tag) => tag.value)).toEqual([
      "message",
      "emailAddress",
    ]);
  });
  expect(removed.isConnected).toBe(true);
  const saved = serializeFieldTags(tagify.getMixedTagsAsString());
  expect(saved).toBe("field:message field:emailAddress");
  expect(editor(saved).value.map((tag) => tag.value)).toEqual([
    "message",
    "emailAddress",
  ]);
});
