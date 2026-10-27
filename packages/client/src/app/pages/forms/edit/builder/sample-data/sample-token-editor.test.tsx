import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type Tagify from "@yaireo/tagify";
import { act, createRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { SampleDataProvider } from "./sample-data.context";
import {
  SampleTokenEditor,
  type SampleTokenEditorHandle,
} from "./sample-token-editor";

vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ current: { id: 1 } }),
}));
vi.mock("@ff-client/utils/translations", () => ({
  default: (value: string) => value,
}));
const catalog = [
  { id: "firstName", label: "First name", value: "Alex" },
  { id: "lastName", label: "Last name", value: "Smith" },
  { id: "city", label: "City", value: "Winnipeg" },
  { id: "sentences", label: "Sentences", value: "One. Two. Three." },
];
let host: HTMLDivElement;
let root: Root;
let client: QueryClient;
let setValue: (value: string) => void;
const editor = createRef<SampleTokenEditorHandle>();
const tokenClick = vi.fn();
const render = (initial: string): Tagify => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  client = new QueryClient();
  client.setQueryData(["sample-data", 1], catalog);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const Harness = () => {
    const [value, updateValue] = useState(initial);
    setValue = updateValue;
    return (
      <>
        <SampleTokenEditor
          ref={editor}
          value={value}
          onChange={updateValue}
          onTokenClick={tokenClick}
          id="defaultValue"
          label="Default value"
          multiline={false}
        />
        <output>{value}</output>
        <button
          type="button"
          onClick={() => editor.current?.insert(catalog[1])}
        >
          Insert
        </button>
      </>
    );
  };
  act(() =>
    root.render(
      <QueryClientProvider client={client}>
        <SampleDataProvider>
          <Harness />
        </SampleDataProvider>
      </QueryClientProvider>,
    ),
  );
  return (
    host.querySelector("textarea") as HTMLTextAreaElement & { __tagify: Tagify }
  ).__tagify;
};
const settle = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
};
const select = (range: Range) => {
  window.getSelection()!.removeAllRanges();
  window.getSelection()!.addRange(range);
};
afterEach(() => {
  act(() => root?.unmount());
  host?.remove();
  client?.clear();
  tokenClick.mockClear();
  vi.unstubAllGlobals();
});

it("keeps typed suffixes, caret position, and existing chips when adding another sample", async () => {
  const tagify = render("{{ faker.firstName|raw }}");
  await settle();
  const chip = tagify.getTagElms()[0];
  expect(chip.textContent).toContain("First name");
  act(() => {
    tagify.DOM.input.focus();
    const range = document.createRange();
    range.setStartAfter(chip);
    range.collapse(true);
    const text = document.createTextNode(" 123 ");
    range.insertNode(text);
    range.setStart(text, text.length);
    range.collapse(true);
    select(range);
    tagify.DOM.input.dispatchEvent(new InputEvent("input", { bubbles: true }));
  });
  await settle();
  expect(host.querySelector("output")!.textContent).toBe(
    "{{ faker.firstName|raw }} 123 ",
  );
  expect(tagify.getTagElms()[0]).toBe(chip);
  act(() => {
    host.querySelector("button")!.focus();
    host.querySelector("button")!.click();
  });
  await settle();
  expect(host.querySelector("output")!.textContent).toBe(
    "{{ faker.firstName|raw }} 123 {{ faker.lastName|raw }}",
  );
});

it("replaces only the clicked pill and supports external undo/redo", async () => {
  const original =
    "Before {{ faker.firstName }}123 {{ faker.lastName|raw }} after";
  const tagify = render(original);
  await settle();
  act(() => tagify.getTagElms()[0].click());
  expect(tokenClick).toHaveBeenCalledWith(tagify.getTagElms()[0], "firstName");
  act(() => editor.current!.insert(catalog[2], tagify.getTagElms()[0]));
  await settle();
  const changed =
    "Before {{ faker.city|raw }}123 {{ faker.lastName|raw }} after";
  expect(host.querySelector("output")!.textContent).toBe(changed);
  act(() => setValue(original));
  expect(tagify.value.map((tag) => tag.value)).toEqual([
    "firstName",
    "lastName",
  ]);
  act(() => setValue(changed));
  expect(tagify.value.map((tag) => tag.value)).toEqual(["city", "lastName"]);
});

it("preserves plain text, literal tag delimiters, and advanced Twig without creating HTML", async () => {
  const original =
    "<b>Hi & welcome</b> [[literal]] {{ faker.numberBetween(1, 10)|raw }}";
  const tagify = render(original);
  await settle();
  expect(tagify.getTagElms()).toHaveLength(0);
  expect(tagify.DOM.input.querySelector("b")).toBeNull();
  expect(editor.current!.flush()).toBe(original);
});

it("inserts the three-sentence preset and preserves its expression when reopened", async () => {
  const tagify = render("");
  act(() => editor.current!.insert(catalog[3]));
  await settle();
  expect(host.querySelector("output")!.textContent).toBe(
    "{{ faker.sentences(3, true)|raw }}",
  );
  expect(tagify.getTagElms()[0].textContent).toContain("Sentences");

  const expression = "{{ faker.sentences(3, true) }}";
  act(() => setValue(expression));
  await settle();
  expect(tagify.value.map((tag) => tag.value)).toEqual(["sentences"]);
  expect(editor.current!.flush()).toBe(expression);
});

it("turns a manually entered simple Twig expression into a pill on blur", async () => {
  const tagify = render("");
  act(() => {
    tagify.DOM.input.focus();
    tagify.injectAtCaret("{{ faker.city }}123");
  });
  await settle();
  act(() => host.querySelector("button")!.focus());
  await settle();
  expect(host.querySelector("output")!.textContent).toBe("{{ faker.city }}123");
  expect(tagify.getTagElms()).toHaveLength(1);
  expect(tagify.getTagElms()[0].textContent).toContain("City");
});

it.each(["saved", "typed"])(
  "does not warn when a %s sample token starts the input",
  async (source) => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const value = "{{ faker.city }}123";
    try {
      const tagify = render(source === "saved" ? value : "");
      if (source === "typed") {
        act(() => {
          tagify.DOM.input.focus();
          tagify.injectAtCaret(value);
        });
        await settle();
        act(() => host.querySelector("button")!.focus());
      }
      await settle();
      expect(tagify.getTagElms()).toHaveLength(1);
      act(() => expect(editor.current!.flush()).toBe(value));
      expect(
        warn.mock.calls.filter((args) =>
          args.some((arg) => String(arg).includes("tag element doesn't exist")),
        ),
      ).toEqual([]);
    } finally {
      warn.mockRestore();
    }
  },
);

it("inserts in the middle and removes a pill without consuming surrounding text", async () => {
  const tagify = render(
    "Before {{ faker.firstName }} middle {{ faker.lastName }} after",
  );
  await settle();
  act(() => {
    tagify.DOM.input.focus();
    const middle = Array.from(tagify.DOM.input.childNodes).find(
      (node) =>
        node.nodeType === Node.TEXT_NODE && node.textContent === " middle ",
    )!;
    const range = document.createRange();
    range.setStart(middle, 1);
    range.collapse(true);
    select(range);
    host.querySelector("button")!.focus();
    editor.current!.insert(catalog[2]);
  });
  await settle();
  expect(host.querySelector("output")!.textContent).toBe(
    "Before {{ faker.firstName }} {{ faker.city|raw }}middle {{ faker.lastName }} after",
  );
  await act(async () => {
    await tagify.removeTags(tagify.getTagElms()[1], false, 0);
  });
  await settle();
  expect(host.querySelector("output")!.textContent).toBe(
    "Before {{ faker.firstName }} middle {{ faker.lastName }} after",
  );
});

it("opens the picker with the keyboard without enabling inline pill editing", async () => {
  const tagify = render("{{ faker.firstName }}");
  await settle();
  const chip = tagify.getTagElms()[0];
  act(() => {
    chip.focus();
    chip.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await settle();
  expect(tokenClick).toHaveBeenCalledWith(chip, "firstName");
  expect(chip.getAttribute("contenteditable")).toBe("false");
  expect(host.querySelector("output")!.textContent).toBe(
    "{{ faker.firstName }}",
  );
});
