import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

const source = readFileSync(
  resolve(__dirname, "../../plugin/src/codepack/assets/js/demo.js"),
  "utf8",
);
const markup = (area = "forms") => `
  <section data-form-browser data-view="cards">
    <div data-browser-tools hidden>
      <input type="search" data-browser-search>
      <button data-browser-view="cards" aria-pressed="true">Cards</button>
      <button data-browser-view="list" aria-pressed="false">List</button>
    </div>
    <p data-browser-status role="status" hidden></p>
    <a data-browser-item data-form-search="Contact Team enquiries" href="/demo/${area}/contact">Contact</a>
    <a data-browser-item data-form-search="Café registration Event attendees" href="/demo/${area}/cafe">Café registration</a>
    <div data-browser-empty hidden><button data-browser-clear>Clear search</button></div>
  </section>`;

function setup(area = "forms") {
  document.body.innerHTML = markup(area);
  // biome-ignore lint/security/noGlobalEval: execute the shipped repository asset in the DOM fixture.
  window.eval(source);
  return {
    browser: document.querySelector<HTMLElement>("[data-form-browser]")!,
    search: document.querySelector<HTMLInputElement>("input")!,
    cards: document.querySelector<HTMLButtonElement>(
      '[data-browser-view="cards"]',
    )!,
    list: document.querySelector<HTMLButtonElement>(
      '[data-browser-view="list"]',
    )!,
    items: [
      ...document.querySelectorAll<HTMLAnchorElement>("[data-browser-item]"),
    ],
    status: document.querySelector<HTMLElement>("[data-browser-status]")!,
    empty: document.querySelector<HTMLElement>("[data-browser-empty]")!,
  };
}
beforeEach(() => localStorage.clear());
afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
});

it("defaults to cards and switches views without changing form destinations", () => {
  const { browser, cards, list, items } = setup();
  expect(browser.dataset.view).toBe("cards");
  expect(
    document.querySelector<HTMLElement>("[data-browser-tools]")!.hidden,
  ).toBe(false);
  list.click();
  expect(browser.dataset.view).toBe("list");
  expect(list.getAttribute("aria-pressed")).toBe("true");
  expect(cards.getAttribute("aria-pressed")).toBe("false");
  expect(items.map((item) => item.getAttribute("href"))).toEqual([
    "/demo/forms/contact",
    "/demo/forms/cafe",
  ]);
});

it("remembers the selected view when moving from Forms to Submissions", () => {
  setup().list.click();
  const next = setup("submissions");
  expect(next.browser.dataset.view).toBe("list");
  next.cards.click();
  expect(setup().browser.dataset.view).toBe("cards");
});

it("searches names and descriptions, ignores accents, and recovers from no results", () => {
  const { search, items, status, empty, list } = setup();
  const filter = (value: string) => {
    search.value = value;
    search.dispatchEvent(new Event("input"));
  };
  filter("ATTENDEES cafe");
  expect(items.map((item) => item.hidden)).toEqual([true, false]);
  expect(status.textContent).toBe("1 of 2 forms");
  list.click();
  expect(items[0].hidden).toBe(true);
  filter("no matches");
  expect(empty.hidden).toBe(false);
  expect(status.textContent).toBe("0 of 2 forms");
  document.querySelector<HTMLButtonElement>("[data-browser-clear]")!.click();
  expect(items.every((item) => !item.hidden)).toBe(true);
  expect(empty.hidden).toBe(true);
  expect(status.hidden).toBe(true);
  expect(document.activeElement).toBe(search);
});

it("keeps the switcher usable when storage is unavailable", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  const { browser, list } = setup();
  expect(browser.dataset.view).toBe("cards");
  expect(() => list.click()).not.toThrow();
  expect(browser.dataset.view).toBe("list");
});

it("falls back to cards for an unrecognized saved preference", () => {
  localStorage.setItem("freeform-demo-form-view", "unknown");
  expect(setup().browser.dataset.view).toBe("cards");
});

it("filters only the current submission page and recovers from no matches", () => {
  document.body.innerHTML = `
    <section data-submissions-browser>
      <label data-submissions-tools hidden><input data-submissions-search></label>
      <p data-submissions-status role="status">2 on this page · Newest first</p>
      <table><tbody>
        <tr data-submission-row><td>Café registration</td><td>Taylor Morgan</td></tr>
        <tr data-submission-row><td>Support request</td><td>Jordan</td></tr>
        <tr data-submissions-empty hidden><td><button data-submissions-clear>Clear search</button></td></tr>
      </tbody></table>
    </section>`;
  // biome-ignore lint/security/noGlobalEval: execute the shipped repository asset in the DOM fixture.
  window.eval(source);
  const search = document.querySelector<HTMLInputElement>("input")!;
  const rows = [
    ...document.querySelectorAll<HTMLElement>("[data-submission-row]"),
  ];
  const empty = document.querySelector<HTMLElement>(
    "[data-submissions-empty]",
  )!;
  const status = document.querySelector("[data-submissions-status]")!;
  const filter = (value: string) => {
    search.value = value;
    search.dispatchEvent(new Event("input"));
  };
  expect(
    document.querySelector<HTMLElement>("[data-submissions-tools]")!.hidden,
  ).toBe(false);
  filter("MORGAN cafe");
  expect(rows.map((row) => row.hidden)).toEqual([false, true]);
  expect(status.textContent).toBe("1 of 2 on this page");
  filter("another page");
  expect(empty.hidden).toBe(false);
  expect(status.textContent).toBe("0 of 2 on this page");
  document
    .querySelector<HTMLButtonElement>("[data-submissions-clear]")!
    .click();
  expect(rows.every((row) => !row.hidden)).toBe(true);
  expect(empty.hidden).toBe(true);
  expect(status.textContent).toBe("2 on this page · Newest first");
  expect(document.activeElement).toBe(search);
});

it("searches example topics and announces examples while preserving view preferences", () => {
  document.body.innerHTML = markup("extras")
    .replace(
      'data-form-browser data-view="cards"',
      'data-form-browser data-browser-noun="examples" data-view="cards"',
    )
    .replace(
      'data-form-search="Contact Team enquiries"',
      'data-browser-search="Current user data Data & relations"',
    );
  const groups = [
    ...document.querySelectorAll<HTMLElement>("[data-browser-item]"),
  ].map((item) => {
    const group = document.createElement("section");
    group.dataset.browserGroup = "";
    group.innerHTML = "<span data-browser-group-count>1</span>";
    item.before(group);
    group.append(item);
    return group;
  });
  // biome-ignore lint/security/noGlobalEval: execute the shipped repository asset in the DOM fixture.
  window.eval(source);
  const search = document.querySelector<HTMLInputElement>("input")!;
  search.value = "relations";
  search.dispatchEvent(new Event("input"));
  expect(document.querySelector("[data-browser-status]")!.textContent).toBe(
    "1 of 2 examples",
  );
  const items = [
    ...document.querySelectorAll<HTMLElement>("[data-browser-item]"),
  ];
  expect(items.map((item) => item.hidden)).toEqual([false, true]);
  document
    .querySelector<HTMLButtonElement>('[data-browser-view="list"]')!
    .click();
  expect(
    document.querySelector<HTMLElement>("[data-form-browser]")!.dataset.view,
  ).toBe("list");
  expect(items[0].getAttribute("href")).toBe("/demo/extras/contact");
  expect(groups.map((group) => group.hidden)).toEqual([false, true]);
  expect(
    groups.map(
      (group) => group.querySelector("[data-browser-group-count]")!.textContent,
    ),
  ).toEqual(["1", "0"]);
  document.querySelector<HTMLButtonElement>("[data-browser-clear]")!.click();
  expect(groups.every((group) => !group.hidden)).toBe(true);
});
