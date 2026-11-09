import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { useSidebarSelect } from "./use-sidebar-select";

let root: Root;
let container: HTMLDivElement;
let navigation: HTMLDivElement;

function Fixture({ section }: { section: string }) {
  useSidebarSelect(section);
  return null;
}

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  navigation?.remove();
  vi.unstubAllGlobals();
});

function setup(version: 4 | 5) {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  navigation = document.createElement("div");
  const links = ["forms", "integrations", "ab-tests"].map((section) => {
    const selected = section === "forms";
    const anchor = `<a href="/control/freeform/${section}" class="${version === 5 ? "sidebar-action sidebar-action--sub" : ""} ${selected ? "sel" : ""}" ${selected ? 'aria-current="page"' : ""}>${section}</a>`;
    return `<li>${version === 5 ? `<div class="nav-item nav-item--sub ${selected ? "sel" : ""}">${anchor}</div>` : anchor}</li>`;
  });
  navigation.innerHTML = `<li id="nav-freeform"><a href="/control/freeform">Freeform</a><ul class="${version === 5 ? "nav-item__subnav" : "subnav"}">${links.join("")}</ul></li><a href="/control/entries" class="sel" aria-current="page">Entries</a>`;
  document.body.append(navigation);
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
}

it.each([4, 5] as const)(
  "selects the active section and restores Forms using Craft %s navigation",
  (version) => {
    setup(version);
    const selected = () =>
      Array.from(
        navigation.querySelectorAll("#nav-freeform > ul a.sel"),
        (link) => link.textContent,
      );
    act(() => root.render(<Fixture section="integrations" />));
    expect(selected()).toEqual(["integrations"]);
    const integration = navigation.querySelector('a[href$="/integrations"]')!;
    expect(integration.getAttribute("aria-current")).toBe("page");
    expect(
      navigation
        .querySelector('a[href$="/forms"]')!
        .hasAttribute("aria-current"),
    ).toBe(false);
    if (version === 5) {
      expect(integration.parentElement!.classList.contains("sel")).toBe(true);
    }
    act(() => root.render(<Fixture section="ab-tests" />));
    expect(selected()).toEqual(["ab-tests"]);
    expect(integration.hasAttribute("aria-current")).toBe(false);
    act(() => root.render(null));
    expect(selected()).toEqual(["forms"]);
    expect(
      navigation
        .querySelector('a[href="/control/entries"]')!
        .classList.contains("sel"),
    ).toBe(true);
  },
);

it("allows mounting and cleanup when the Freeform subnav is unavailable", () => {
  setup(4);
  navigation.innerHTML = "";
  expect(() => {
    act(() => root.render(<Fixture section="integrations" />));
    act(() => root.render(null));
  }).not.toThrow();
});
