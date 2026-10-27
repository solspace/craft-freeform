import { afterEach, expect, it, vi } from "vitest";
import { enhanceCraft6Settings } from "./shell.settings";

afterEach(() => document.body.replaceChildren());

it("keeps the live settings, submenu, and save controls inside their original form", () => {
  document.body.innerHTML = `<main id="main"><form id="main-form">
    <input type="hidden" name="_token" value="csrf">
    <div id="header-container"><h1>General Settings</h1></div>
    <div id="main-content"><aside id="sidebar-container">
      <craft-pane id="freeform-settings-pane" hidden></craft-pane>
      <nav><a href="/settings/general" aria-current="page">General</a></nav>
    </aside><div id="content-container"><input name="settings[name]" value="Unsaved"></div></div>
    <footer id="footer"><button type="submit">Save</button></footer>
  </form></main>`;
  const form = document.querySelector<HTMLFormElement>("form")!;
  const input = form.querySelector<HTMLInputElement>(
    '[name="settings[name]"]',
  )!;
  const button = form.querySelector<HTMLButtonElement>("button")!;
  const submit = vi.fn((event: Event) => event.preventDefault());
  form.addEventListener("submit", submit);
  enhanceCraft6Settings();
  enhanceCraft6Settings();
  const pane = document.querySelector<HTMLElement>("craft-pane")!;
  expect(pane.hidden).toBe(false);
  expect(pane.parentElement).toBe(form);
  expect(pane.querySelector("input")).toBe(input);
  expect(input.value).toBe("Unsaved");
  expect(button.form).toBe(form);
  expect(pane.querySelector('[aria-current="page"]')?.textContent).toBe(
    "General",
  );
  button.click();
  expect(submit).toHaveBeenCalledOnce();
});
