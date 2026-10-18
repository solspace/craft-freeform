import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { replace } from "@ff-client/utils/translations";
import axios from "axios";
import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { DeleteFormModal } from "./modal.form.delete";

const fixture = vi.hoisted(() => ({
  close: vi.fn(),
  invalidate: vi.fn(),
}));
vi.mock("axios", () => ({ default: { post: vi.fn() } }));
vi.mock("@ff-client/contexts/site/site.context", () => ({
  useSiteContext: () => ({ getCurrentHandleWithFallback: () => "default" }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: fixture.invalidate }),
}));
vi.mock("@ff-client/queries/forms", () => ({
  QKForms: { all: (site: string) => ["forms", site] },
}));
vi.mock("@components/loaders/loading-text/loading-text", () => ({
  LoadingText: ({ children }: { children: ReactNode }) => (
    <span>{children}</span>
  ),
}));

// Read the shipped dictionaries so the displayed word and acceptance tests
// exercise the same translations registered by FormsController.
function translations(language: string): Record<string, string> {
  const source = readFileSync(
    resolve(
      __dirname,
      `../../../../../../../plugin/src/translations/${language}/freeform.php`,
    ),
    "utf8",
  );
  return Object.fromEntries(
    Array.from(
      source.matchAll(/^ {4}'((?:\\.|[^'\\])*)' => '((?:\\.|[^'\\])*)',$/gm),
      ([, key, value]) => [key, value.replace(/\\(['\\])/g, "$1")],
    ),
  );
}

let root: Root;
let host: HTMLDivElement;
const deleteButton = () => host.querySelector<HTMLButtonElement>(".submit")!;
function typeWord(value: string) {
  const input = host.querySelector("input")!;
  act(() => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
function render(language: string) {
  const dictionary = translations(language);
  vi.stubGlobal("Craft", {
    t: (_category: string, text: string, params: Record<string, string>) =>
      replace(dictionary[text] ?? text, params),
  });
  act(() =>
    root.render(
      <DeleteFormModal
        data={{ form: { id: 42, name: "Contact" } }}
        closeModal={fixture.close}
      />,
    ),
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.clearAllMocks();
  vi.mocked(axios.post).mockResolvedValue({ data: {} });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(() => {
  act(() => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});

it.each([
  ["en", "delete"],
  ["de", "löschen"],
  ["fr", "supprimer"],
  ["it", "elimina"],
  ["nl", "verwijder"],
])("requires the displayed %s word, ignoring case", async (language, word) => {
  render(language);
  const input = host.querySelector("input")!;
  expect(input.labels?.[0]?.querySelector("strong")?.textContent).toBe(
    word.toUpperCase(),
  );
  expect(word).toMatch(/^\p{L}+$/u);
  expect(deleteButton().disabled).toBe(true);
  typeWord("wrong");
  await act(async () => {
    deleteButton().click();
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
  });
  expect(axios.post).not.toHaveBeenCalled();
  if (language !== "en") {
    typeWord("delete");
    expect(deleteButton().disabled).toBe(true);
  }
  for (const value of [
    word,
    word.toUpperCase(),
    word[0].toUpperCase() + word.slice(1),
  ]) {
    typeWord(value);
    expect(deleteButton().disabled).toBe(false);
  }
  typeWord(word.slice(0, -1));
  expect(deleteButton().disabled).toBe(true);
  typeWord(word);
  await act(async () => deleteButton().click());
  expect(axios.post).toHaveBeenCalledExactlyOnceWith("/api/forms/delete", {
    id: 42,
  });
  expect(fixture.invalidate).toHaveBeenCalledWith({
    queryKey: ["groups", "default"],
  });
  expect(fixture.invalidate).toHaveBeenCalledWith({
    queryKey: ["forms", "default"],
  });
  expect(fixture.close).toHaveBeenCalledOnce();
});

it("accepts decomposed German umlauts and prevents repeat deletion while pending", async () => {
  render("de");
  typeWord("LÖSCHEN".normalize("NFD"));
  expect(deleteButton().disabled).toBe(false);
  let finish: () => void;
  vi.mocked(axios.post).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = () => resolve({ data: {} });
      }),
  );
  await act(async () =>
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" })),
  );
  expect(deleteButton().disabled).toBe(true);
  await act(async () => {
    deleteButton().click();
    document.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter" }));
  });
  expect(axios.post).toHaveBeenCalledOnce();
  await act(async () => finish());
});

it("falls back to the English word when no Craft translation is available", () => {
  act(() => root.render(<DeleteFormModal closeModal={fixture.close} />));
  expect(host.querySelector("label strong")?.textContent).toBe("DELETE");
  typeWord("Delete");
  expect(deleteButton().disabled).toBe(false);
});
