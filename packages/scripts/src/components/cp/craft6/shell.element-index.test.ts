import { afterEach, expect, it, vi } from "vitest";
import { enhanceCraft6ElementIndex } from "./shell.element-index";

afterEach(() => document.body.replaceChildren());

it("retains live search, filters, sources, pagination, and export bindings in the native pane", async () => {
  document.body.innerHTML = `<main>
    <div id="header-container"><header><h1>Submissions</h1><div id="toolbar">
      <div data-export-wrapper><button id="quick-export">Export</button></div>
      <div class="search-container"><span class="texticon-icon"></span>
        <craft-input><input value="existing search"></craft-input>
        <button class="clear-btn">Clear</button><button class="filter-btn">Filter</button>
      </div>
    </div></header></div>
    <div id="main-content"><aside id="sidebar-container"><nav id="sources"><button>Test form</button></nav></aside>
      <div id="content-container"><div id="content">
        <craft-pane id="freeform-index-pane" padding="0" hidden></craft-pane>
        <div id="elements">Rows</div><footer id="footer">Pagination</footer>
      </div></div>
    </div></main>`;
  const input = document.querySelector("input")!;
  const filter = document.querySelector<HTMLButtonElement>(".filter-btn")!;
  const exportWrapper = document.querySelector("[data-export-wrapper]")!;
  const source = document.querySelector<HTMLButtonElement>("#sources button")!;
  const selectSource = vi.fn();
  source.addEventListener("click", selectSource);
  const click = vi.fn();
  filter.addEventListener("click", click);

  enhanceCraft6ElementIndex();
  enhanceCraft6ElementIndex();
  const pane = document.querySelector<HTMLElement>("craft-pane")!;
  expect(pane.hidden).toBe(false);
  expect(pane.querySelector("input")).toBe(input);
  expect(input.value).toBe("existing search");
  expect(pane.querySelector('[slot="suffix"] .filter-btn')).toBe(filter);
  expect(pane.querySelectorAll('craft-icon[slot="prefix"]')).toHaveLength(1);
  expect(pane.querySelector("#footer")?.textContent).toBe("Pagination");
  expect(pane.contains(document.querySelector("#sources"))).toBe(true);
  expect(pane.querySelector("#sidebar-container button")).toBe(source);
  source.click();
  expect(selectSource).toHaveBeenCalledOnce();
  filter.click();
  expect(click).toHaveBeenCalledOnce();

  const toolbar = document.querySelector("#toolbar")!;
  toolbar.append(document.createElement("button"));
  await Promise.resolve();
  expect(toolbar.lastElementChild).toBe(exportWrapper);
  expect(exportWrapper.querySelector("#quick-export")).not.toBeNull();
});

it("leaves other CP pages unchanged", () => {
  document.body.innerHTML = "<main><h1>Settings</h1></main>";
  enhanceCraft6ElementIndex();
  expect(document.body.innerHTML).toBe("<main><h1>Settings</h1></main>");
});

it("keeps sorting buttons live and updates native status and sort indicators after Ajax rows", async () => {
  document.body.innerHTML = `<div id="rows" data-statuses='{"2":{"handle":"open","color":"teal","label":"Open"}}'>
    <div id="elements"><table><thead><tr><th class="orderable" aria-sort="none"><button>Submission</button></th></tr></thead>
    <tbody><tr><td><craft-chip data-status="open"><a>Title</a></craft-chip></td></tr></tbody></table></div></div>`;
  const { enhanceCraft6IndexRows } = await import("./shell.element-index");
  const root = document.querySelector<HTMLElement>("#rows")!;
  const button = root.querySelector<HTMLButtonElement>("th button")!;
  const sort = vi.fn();
  button.addEventListener("click", sort);
  enhanceCraft6IndexRows(root);
  expect(root.querySelector('craft-indicator[fill="teal"]')).not.toBeNull();
  expect(button.querySelector("craft-icon")?.getAttribute("name")).toBe(
    "arrow-up-arrow-down",
  );
  root.querySelector("th")!.setAttribute("aria-sort", "descending");
  await Promise.resolve();
  expect(button.querySelector("craft-icon")?.getAttribute("name")).toBe("desc");
  button.click();
  expect(sort).toHaveBeenCalledOnce();
  const chip = document.createElement("craft-chip");
  chip.dataset.status = "open";
  root.querySelector("td")!.append(chip);
  await Promise.resolve();
  expect(chip.querySelectorAll("craft-indicator")).toHaveLength(1);
  expect(root.querySelectorAll("craft-indicator")).toHaveLength(2);
});
